"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Toast } from "@/components/Toast";
import type { ToastState } from "@/components/Toast";
import {
  inviteMemberAction,
  updateMemberRoleAction,
  removeMemberAction,
  getTeamMembersAction,
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

  useEffect(() => {
    const checkAndFetch = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const fresh = await getTeamMembersAction(projectId);
        setMembers((current) => {
          if (current.length !== fresh.length) {
            return fresh;
          }
          const currentSorted = [...current].sort((x, y) => x.id.localeCompare(y.id));
          const freshSorted = [...fresh].sort((x, y) => x.id.localeCompare(y.id));
          const isEqual = currentSorted.every((memberA, index) => {
            const memberB = freshSorted[index];
            return (
              memberB &&
              memberA.id === memberB.id &&
              memberA.projectId === memberB.projectId &&
              memberA.userId === memberB.userId &&
              memberA.role === memberB.role &&
              memberA.userName === memberB.userName &&
              memberA.userEmail === memberB.userEmail
            );
          });
          if (isEqual) {
            return current;
          }
          return fresh;
        });
      } catch {
      }
    };

    const intervalId = setInterval(checkAndFetch, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndFetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [projectId]);

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
    <div className="mt-8 space-y-8 animate-hero" style={{ animationDelay: "60ms" }}>
      <section aria-labelledby="members-heading">
        <h2 id="members-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
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

      <section aria-labelledby="invite-heading" className="animate-hero" style={{ animationDelay: "120ms" }}>
        <h2 id="invite-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
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
      <p className="text-sm text-zinc-500 dark:text-zinc-400">No members yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-card border border-zinc-200 dark:border-zinc-800 bg-[#FDFDFD] dark:bg-zinc-900/20 shadow-sm">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm" aria-label="Project members">
        <thead className="bg-zinc-50 dark:bg-zinc-900/60">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
              Member
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
              Role
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/80 bg-white dark:bg-zinc-900/10">
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
  const canChangeRole = !isSelf && !isLastOwner;
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
    <tr className="transition-colors duration-[150ms] hover:bg-zinc-50 dark:hover:bg-zinc-800/30" aria-busy={isPending}>
      <td className="px-4 py-3">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{displayName}</p>
        {member.userName && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{member.userEmail}</p>
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
              className="rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-650 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 disabled:opacity-60"
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
            className="inline-flex items-center gap-1 rounded border border-red-300 dark:border-red-900/50 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 transition-colors duration-[150ms] hover:bg-red-50 dark:hover:bg-red-950/20 active:bg-red-100 dark:active:bg-red-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="rounded-card border border-zinc-200 dark:border-zinc-800 bg-[#FDFDFD] dark:bg-zinc-900/20 p-6 shadow-sm">
      <form onSubmit={handleSubmit} noValidate aria-label={`Invite member to ${projectName}`}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label
              htmlFor="invite-email"
              className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
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
              className="w-full rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 disabled:opacity-60"
            />
            {fieldError && (
              <p className="mt-1 text-xs text-red-650 dark:text-red-400" role="alert">{fieldError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="invite-role"
              className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as AssignableRole)}
              disabled={isPending}
              style={{ minHeight: "44px" }}
              className="rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-650 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 disabled:opacity-60"
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
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 shadow-sm transition-all duration-[150ms] ease-out hover:bg-black dark:hover:bg-white hover:scale-[1.03] active:scale-[0.98] focus-visible:rounded-pill disabled:opacity-60 motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
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
          className="mt-4 rounded-input border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300"
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
  OWNER: "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:ring-indigo-900/50",
  ADMIN: "bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:ring-violet-900/50",
  MEMBER: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900/50",
  VIEWER: "bg-gray-100 text-gray-600 ring-1 ring-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700",
};

function RoleBadge({ role }: { role: string }) {
  const label = role.charAt(0) + role.slice(1).toLowerCase();
  return (
    <span
      className={`inline-block rounded-pill px-2 py-0.5 text-xs font-semibold ${ROLE_BADGE_CLASSES[role] ?? ""}`}
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
