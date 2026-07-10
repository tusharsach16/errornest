"use client";

import { useCallback, useState, useTransition } from "react";
import { Toast } from "@/components/Toast";
import type { ToastState } from "@/components/Toast";
import {
  inviteMemberAction,
  updateMemberRoleAction,
  removeMemberAction,
} from "./actions";
import type { MemberWithUser, AssignableRole } from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewerRole = "OWNER" | "ADMIN";

interface Props {
  projectId: string;
  projectName: string;
  currentUserId: string;
  currentRole: ViewerRole;
  initialMembers: MemberWithUser[];
}

// ─── Main client component ────────────────────────────────────────────────────

export function TeamClient({
  projectId,
  projectName,
  currentUserId,
  currentRole,
  initialMembers,
}: Props) {
  const [members, setMembers] = useState<MemberWithUser[]>(initialMembers);
  const [toast, setToast] = useState<ToastState | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  const ownerCount = members.filter((m) => m.role === "OWNER").length;

  const handleRoleChange = useCallback(
    async (targetUserId: string, role: AssignableRole) => {
      const prev = members;
      setMembers((ms) =>
        ms.map((m) => (m.userId === targetUserId ? { ...m, role } : m)),
      );

      const result = await updateMemberRoleAction(projectId, targetUserId, role);

      if (!result.ok) {
        setMembers(prev);
        setToast({ message: result.error, variant: "error" });
        return;
      }
      setToast({ message: "Role updated", variant: "success" });
    },
    [projectId, members],
  );

  const handleRemove = useCallback(
    async (targetUserId: string) => {
      const prev = members;
      setMembers((ms) => ms.filter((m) => m.userId !== targetUserId));

      const result = await removeMemberAction(projectId, targetUserId);

      if (!result.ok) {
        setMembers(prev);
        setToast({ message: result.error, variant: "error" });
        return;
      }
      setToast({ message: "Member removed", variant: "success" });
    },
    [projectId, members],
  );

  const handleInviteSuccess = useCallback((member: MemberWithUser) => {
    setMembers((ms) => [...ms, member]);
    setToast({ message: `${member.userEmail} added to the project`, variant: "success" });
  }, []);

  return (
    <div className="mt-8 space-y-8">
      <section aria-labelledby="members-heading">
        <h2 id="members-heading" className="mb-4 text-base font-semibold text-gray-700">
          Members
        </h2>
        <MemberTable
          members={members}
          ownerCount={ownerCount}
          currentUserId={currentUserId}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          onRemove={handleRemove}
          onToast={setToast}
        />
      </section>

      <section aria-labelledby="invite-heading">
        <h2 id="invite-heading" className="mb-4 text-base font-semibold text-gray-700">
          Invite a new member
        </h2>
        <InviteForm
          projectId={projectId}
          projectName={projectName}
          onSuccess={handleInviteSuccess}
          onToast={setToast}
        />
      </section>

      {toast && (
        <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />
      )}
    </div>
  );
}

// ─── Member table ─────────────────────────────────────────────────────────────

function MemberTable({
  members,
  ownerCount,
  currentUserId,
  currentRole,
  onRoleChange,
  onRemove,
  onToast,
}: {
  members: MemberWithUser[];
  ownerCount: number;
  currentUserId: string;
  currentRole: ViewerRole;
  onRoleChange: (userId: string, role: AssignableRole) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  onToast: (t: ToastState) => void;
}) {
  if (members.length === 0) {
    return (
      <p className="text-sm text-gray-500">No members yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-card border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm" aria-label="Project members">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Member
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Role
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              ownerCount={ownerCount}
              isSelf={member.userId === currentUserId}
              currentRole={currentRole}
              onRoleChange={onRoleChange}
              onRemove={onRemove}
              onToast={onToast}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Member row ───────────────────────────────────────────────────────────────

function MemberRow({
  member,
  ownerCount,
  isSelf,
  currentRole,
  onRoleChange,
  onRemove,
  onToast,
}: {
  member: MemberWithUser;
  ownerCount: number;
  isSelf: boolean;
  currentRole: ViewerRole;
  onRoleChange: (userId: string, role: AssignableRole) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  onToast: (t: ToastState) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const isLastOwner = member.role === "OWNER" && ownerCount === 1;
  // Can change role only if admin/owner, not own row, not last owner row
  const canChangeRole = !isSelf && !isLastOwner;
  // Remove button only visible to OWNERs, never on self or last owner
  const canRemove = currentRole === "OWNER" && !isSelf && !isLastOwner;

  const displayName = member.userName ?? member.userEmail;

  const handleRoleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as AssignableRole;
    startTransition(async () => {
      await onRoleChange(member.userId, next);
    });
  };

  const handleRemoveClick = () => {
    startTransition(async () => {
      await onRemove(member.userId);
    });
  };

  return (
    <tr className="transition-colors duration-[150ms] hover:bg-gray-50" aria-busy={isPending}>
      <td className="px-4 py-3">
        <p className="font-medium text-gray-900">{displayName}</p>
        {member.userName && (
          <p className="text-xs text-gray-500">{member.userEmail}</p>
        )}
      </td>
      <td className="px-4 py-3">
        {member.role === "OWNER" || !canChangeRole ? (
          <RoleBadge role={member.role} />
        ) : (
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor={`role-${member.id}`}>
              Change role for {displayName}
            </label>
            <select
              id={`role-${member.id}`}
              value={member.role as AssignableRole}
              onChange={handleRoleSelect}
              disabled={isPending}
              style={{ minHeight: "44px" }}
              className="rounded-input border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 disabled:opacity-60"
            >
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
              <option value="VIEWER">Viewer</option>
            </select>
            {isPending && <MiniSpinner />}
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        {canRemove && (
          <button
            type="button"
            onClick={handleRemoveClick}
            disabled={isPending}
            aria-disabled={isPending}
            aria-label={`Remove ${displayName} from project`}
            style={{ minHeight: "44px" }}
            className="inline-flex items-center gap-1 rounded border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 transition-colors duration-[150ms] hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? <MiniSpinner /> : null}
            Remove
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Invite form ──────────────────────────────────────────────────────────────

function InviteForm({
  projectId,
  projectName,
  onSuccess,
  onToast,
}: {
  projectId: string;
  projectName: string;
  onSuccess: (member: MemberWithUser) => void;
  onToast: (t: ToastState) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AssignableRole>("MEMBER");
  const [isPending, startTransition] = useTransition();
  const [noAccountEmail, setNoAccountEmail] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setNoAccountEmail(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError("Please enter an email address.");
      return;
    }

    startTransition(async () => {
      const result = await inviteMemberAction(projectId, trimmed, role);

      if (!result.ok) {
        if (result.noAccount) {
          setNoAccountEmail(trimmed);
        } else {
          onToast({ message: result.error, variant: "error" });
        }
        return;
      }

      setEmail("");
      setRole("MEMBER");
      onSuccess(result.member);
    });
  };

  return (
    <div className="rounded-card border border-gray-200 bg-white p-6">
      <form onSubmit={handleSubmit} noValidate aria-label={`Invite member to ${projectName}`}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label
              htmlFor="invite-email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldError(null);
                setNoAccountEmail(null);
              }}
              placeholder="colleague@example.com"
              autoComplete="email"
              disabled={isPending}
              style={{ minHeight: "44px" }}
              className="w-full rounded-input border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 disabled:opacity-60"
            />
            {fieldError && (
              <p className="mt-1 text-xs text-red-600" role="alert">{fieldError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="invite-role"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as AssignableRole)}
              disabled={isPending}
              style={{ minHeight: "44px" }}
              className="rounded-input border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 disabled:opacity-60"
            >
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            style={{ minHeight: "44px" }}
            className="inline-flex items-center gap-2 rounded bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors duration-[150ms] hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/50 disabled:opacity-60"
          >
            {isPending && <MiniSpinner />}
            {isPending ? "Adding…" : "Add member"}
          </button>
        </div>
      </form>

      {noAccountEmail && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-input border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <span className="font-semibold">{noAccountEmail}</span> doesn&apos;t have an
          ErrorNest account yet. They need to sign up at{" "}
          <span className="font-medium">errornest.app</span> with that email address first.
        </div>
      )}
    </div>
  );
}

// ─── Role badge ───────────────────────────────────────────────────────────────

const ROLE_BADGE_CLASSES: Record<string, string> = {
  OWNER: "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200",
  ADMIN: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  MEMBER: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  VIEWER: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
};

function RoleBadge({ role }: { role: string }) {
  const label = role.charAt(0) + role.slice(1).toLowerCase();
  return (
    <span
      className={`inline-block rounded-pill px-2 py-0.5 text-xs font-medium ${ROLE_BADGE_CLASSES[role] ?? ""}`}
    >
      {label}
    </span>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function MiniSpinner() {
  return (
    <svg
      aria-hidden="true"
      className="h-3 w-3 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 0 1 9 9" className="opacity-25" />
      <circle cx="12" cy="12" r="9" strokeOpacity={0.25} />
    </svg>
  );
}
