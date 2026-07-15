"use client";

import { useState, useCallback } from "react";
import { updateErrorStatusAction } from "../actions";
import type { ErrorStatus } from "../actions";
import { Toast } from "@/components/Toast";
import type { ToastState } from "@/components/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  projectId: string;
  groupId: string;
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  initialStatus: ErrorStatus;
}

// ─── Static maps ─────────────────────────────────────────────────────────────

const SEVERITY_CLASSES: Record<Props["severity"], string> = {
  INFO: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900/50",
  WARNING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/50",
  ERROR: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-900/50",
  CRITICAL: "bg-red-100 text-red-800 ring-1 ring-red-300 font-semibold dark:bg-red-900/40 dark:text-red-200 dark:ring-red-800",
};

const STATUS_CLASSES: Record<ErrorStatus, string> = {
  OPEN: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-900/50",
  RESOLVED: "bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-950/40 dark:text-green-400 dark:ring-green-900/50",
  IGNORED: "bg-gray-100 text-gray-500 ring-1 ring-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ErrorGroupHeader({ projectId, groupId, severity, initialStatus }: Props) {
  const [status, setStatus] = useState<ErrorStatus>(initialStatus);
  const [isPending, setIsPending] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const handleStatusChange = async (next: ErrorStatus) => {
    const prev = status;
    setStatus(next);
    setIsPending(true);
    setInlineError(null);

    const result = await updateErrorStatusAction(projectId, groupId, next);

    setIsPending(false);

    if (!result.ok) {
      setStatus(prev);
      setInlineError(result.error);
      setToast({ message: result.error, variant: "error" });
      return;
    }

    const label = next === "OPEN" ? "reopened" : next === "RESOLVED" ? "resolved" : "ignored";
    setToast({ message: `Marked as ${label}`, variant: "success" });
  };

  const statusLabel = status.charAt(0) + status.slice(1).toLowerCase();
  const isCriticalOpen = status === "OPEN" && severity === "CRITICAL";

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_CLASSES[severity]}`}
        >
          {isCriticalOpen && (
            <span className="h-1.5 w-1.5 rounded-pill bg-red-500 live-dot shrink-0" aria-hidden="true" />
          )}
          {severity}
        </span>

        <span
          className={`inline-block rounded-pill px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[status]}`}
          aria-label={`Status: ${statusLabel}`}
        >
          {statusLabel}
        </span>

        <div className="flex items-center gap-2" role="group" aria-label="Change error status">
          {status === "OPEN" ? (
            <>
              <ActionButton
                label="Resolve"
                variant="resolve"
                isPending={isPending}
                onClick={() => handleStatusChange("RESOLVED")}
              />
              <ActionButton
                label="Ignore"
                variant="ignore"
                isPending={isPending}
                onClick={() => handleStatusChange("IGNORED")}
              />
            </>
          ) : (
            <ActionButton
              label="Reopen"
              variant="reopen"
              isPending={isPending}
              onClick={() => handleStatusChange("OPEN")}
            />
          )}
        </div>
      </div>

      {inlineError && (
        <p role="alert" className="mt-2 text-xs text-red-650 dark:text-red-400">
          {inlineError}
        </p>
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type ButtonVariant = "resolve" | "ignore" | "reopen";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  resolve:
    "border-green-300 bg-white dark:bg-zinc-900 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 active:bg-green-100 dark:active:bg-green-950/40 dark:border-green-800/80 focus-visible:ring-green-500/40",
  ignore:
    "border-zinc-300 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 active:bg-zinc-100 dark:active:bg-zinc-800 dark:border-zinc-800 focus-visible:ring-zinc-500/40",
  reopen:
    "border-indigo-300 bg-white dark:bg-zinc-900 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 active:bg-indigo-100 dark:active:bg-indigo-950/40 dark:border-indigo-800/80 focus-visible:ring-indigo-600/40",
};

interface ActionButtonProps {
  label: string;
  variant: ButtonVariant;
  isPending: boolean;
  onClick: () => void;
}

function ActionButton({
  label,
  variant,
  isPending,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-disabled={isPending}
      aria-busy={isPending}
      style={{ minHeight: "44px" }}
      className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold transition-colors duration-[150ms] focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]}`}
    >
      {isPending && <Spinner />}
      {label}
    </button>
  );
}

function Spinner() {
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
