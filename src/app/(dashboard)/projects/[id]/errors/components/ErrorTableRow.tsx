import { useState } from "react";
import Link from "next/link";
import type { SerializableErrorGroup, ErrorStatus } from "../actions";
import { SeverityBadge, StatusBadge } from "./Badges";
import { relativeTime } from "../lib/relativeTime";
import { MiniSpinner } from "@/components/MiniSpinner";
import { updateErrorStatusAction } from "../actions";

interface ErrorTableRowProps {
  group: SerializableErrorGroup;
  projectId: string;
  onStatusChange: (groupId: string, next: ErrorStatus) => void;
  onToast: (t: { message: string; variant: "success" | "error" }) => void;
}

export function ErrorTableRow({
  group,
  projectId,
  onStatusChange,
  onToast,
}: ErrorTableRowProps) {
  const href = `/projects/${projectId}/errors/${group.id}`;
  const [status, setStatus] = useState<ErrorStatus>(group.status);
  const [isPending, setIsPending] = useState(false);

  const handleAction = async (next: ErrorStatus) => {
    const prev = status;
    setStatus(next);
    onStatusChange(group.id, next);
    setIsPending(true);

    const result = await updateErrorStatusAction(projectId, group.id, next);
    setIsPending(false);

    if (!result.ok) {
      setStatus(prev);
      onStatusChange(group.id, prev);
      onToast({ message: result.error, variant: "error" });
      return;
    }

    const label = next === "OPEN" ? "reopened" : next === "RESOLVED" ? "resolved" : "ignored";
    onToast({ message: `Marked as ${label}`, variant: "success" });
  };

  return (
    <tr className="relative transition-colors duration-[150ms] hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
      <td className="max-w-[360px] px-4 py-3">
        <Link
          href={href}
          className="block truncate font-medium text-zinc-900 dark:text-zinc-100 after:absolute after:inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-600/40 dark:focus-visible:ring-indigo-500/40"
          title={group.title}
        >
          {group.title}
        </Link>
      </td>
      <td className="px-4 py-3">
        <SeverityBadge severity={group.severity} status={status} />
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
        {group.occurrenceCount.toLocaleString()}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
        {relativeTime(group.lastSeenAt)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={status} />
      </td>
      <td className="relative z-10 px-4 py-3">
        <div className="flex items-center gap-2" role="group" aria-label={`Actions for ${group.title}`}>
          {status === "OPEN" ? (
            <>
              <RowActionButton
                label="Resolve"
                isPending={isPending}
                onClick={() => handleAction("RESOLVED")}
                colorClass="bg-white dark:bg-zinc-900 border-green-300 dark:border-green-800/80 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 active:bg-green-100 dark:active:bg-green-950/40 focus-visible:ring-green-500/40"
              />
              <RowActionButton
                label="Ignore"
                isPending={isPending}
                onClick={() => handleAction("IGNORED")}
                colorClass="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 active:bg-zinc-100 dark:active:bg-zinc-800 focus-visible:ring-zinc-500/40"
              />
            </>
          ) : (
            <RowActionButton
              label="Reopen"
              isPending={isPending}
              onClick={() => handleAction("OPEN")}
              colorClass="bg-white dark:bg-zinc-900 border-indigo-300 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 active:bg-indigo-100 dark:active:bg-indigo-950/40 focus-visible:ring-indigo-600/40"
            />
          )}
        </div>
      </td>
    </tr>
  );
}

function RowActionButton({
  label,
  isPending,
  onClick,
  colorClass,
}: {
  label: string;
  isPending: boolean;
  onClick: () => void;
  colorClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-disabled={isPending}
      aria-busy={isPending}
      style={{ minHeight: "44px" }}
      className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold transition-colors duration-[150ms] focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${colorClass}`}
    >
      {isPending && <MiniSpinner />}
      {label}
    </button>
  );
}
