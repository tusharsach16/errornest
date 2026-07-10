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
  INFO: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  WARNING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  ERROR: "bg-red-50 text-red-700 ring-1 ring-red-200",
  CRITICAL: "bg-red-100 text-red-800 ring-1 ring-red-300 font-semibold",
};

const STATUS_CLASSES: Record<ErrorStatus, string> = {
  OPEN: "bg-red-50 text-red-700 ring-1 ring-red-200",
  RESOLVED: "bg-green-50 text-green-700 ring-1 ring-green-200",
  IGNORED: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
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

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span
          className={`inline-block rounded-pill px-2.5 py-0.5 text-xs ${SEVERITY_CLASSES[severity]}`}
        >
          {severity}
        </span>

        <span
          className={`inline-block rounded-pill px-2.5 py-0.5 text-xs ${STATUS_CLASSES[status]}`}
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
        <p role="alert" className="mt-2 text-xs text-red-600">
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
    "border-green-300 bg-white text-green-700 hover:bg-green-50 active:bg-green-100 focus-visible:ring-green-500/40",
  ignore:
    "border-gray-300 bg-white text-gray-600 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-400/40",
  reopen:
    "border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100 focus-visible:ring-indigo-600/30",
};

function ActionButton({
  label,
  variant,
  isPending,
  onClick,
}: {
  label: string;
  variant: ButtonVariant;
  isPending: boolean;
  onClick: () => void;
}) {
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
