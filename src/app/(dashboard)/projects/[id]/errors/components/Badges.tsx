import type { SerializableErrorGroup, ErrorStatus } from "../actions";

const SEVERITY_CLASSES: Record<SerializableErrorGroup["severity"], string> = {
  INFO: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900/50",
  WARNING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/50",
  ERROR: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-900/50",
  CRITICAL: "bg-red-100 text-red-800 ring-1 ring-red-300 font-semibold dark:bg-red-900/40 dark:text-red-200 dark:ring-red-800",
};

export function SeverityBadge({
  severity,
  status,
}: {
  severity: SerializableErrorGroup["severity"];
  status?: ErrorStatus;
}) {
  const isCriticalOpen = status === "OPEN" && severity === "CRITICAL";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2 py-0.5 text-xs font-semibold ${SEVERITY_CLASSES[severity]}`}
    >
      {isCriticalOpen && (
        <span className="h-1.5 w-1.5 rounded-pill bg-red-500 live-dot shrink-0" aria-hidden="true" />
      )}
      {severity}
    </span>
  );
}

const STATUS_CLASSES: Record<SerializableErrorGroup["status"], string> = {
  OPEN: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-900/50",
  RESOLVED: "bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-950/40 dark:text-green-400 dark:ring-green-900/50",
  IGNORED: "bg-gray-100 text-gray-500 ring-1 ring-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700",
};

export function StatusBadge({ status }: { status: SerializableErrorGroup["status"] }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span
      className={`inline-block rounded-pill px-2 py-0.5 text-xs font-semibold ${STATUS_CLASSES[status]}`}
    >
      {label}
    </span>
  );
}
