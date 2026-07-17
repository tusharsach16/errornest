import { useTransition } from "react";
import type { MemberWithUser, AssignableRole } from "../actions";
import { RoleBadge } from "./Badges";
import { MiniSpinner } from "@/components/MiniSpinner";

interface MemberTableProps {
  members: MemberWithUser[];
  ownerCount: number;
  currentUserId: string;
  currentRole: "OWNER" | "ADMIN";
  onRoleChange: (userId: string, role: AssignableRole) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  onToast: (t: { message: string; variant: "success" | "error" }) => void;
}

export function MemberTable({
  members,
  ownerCount,
  currentUserId,
  currentRole,
  onRoleChange,
  onRemove,
  onToast,
}: MemberTableProps) {
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

interface MemberRowProps {
  member: MemberWithUser;
  ownerCount: number;
  isSelf: boolean;
  currentRole: "OWNER" | "ADMIN";
  onRoleChange: (userId: string, role: AssignableRole) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  onToast: (t: { message: string; variant: "success" | "error" }) => void;
}

function MemberRow({
  member,
  ownerCount,
  isSelf,
  currentRole,
  onRoleChange,
  onRemove,
  onToast,
}: MemberRowProps) {
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
