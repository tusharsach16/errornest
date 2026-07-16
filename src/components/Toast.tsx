"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  variant: "success" | "error";
  onDismiss: () => void;
}

const SUCCESS_DISMISS_MS = 4000;

export function Toast({ message, variant, onDismiss }: ToastProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let el = document.getElementById("toast-container");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast-container";
      el.className =
        "fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex flex-col gap-2 pointer-events-none items-stretch sm:items-end";
      document.body.appendChild(el);
    }
    setContainer(el);
  }, []);

  useEffect(() => {
    if (variant !== "success") return;
    const id = setTimeout(onDismiss, SUCCESS_DISMISS_MS);
    return () => clearTimeout(id);
  }, [variant, onDismiss]);

  if (!container) return null;

  const base =
    "pointer-events-auto flex items-start gap-3 rounded-card px-4 py-3 shadow-lg ring-1 text-sm font-medium transition-opacity duration-[250ms] w-full sm:w-auto sm:max-w-sm";

  const styles =
    variant === "success"
      ? "bg-white dark:bg-zinc-900 text-green-800 dark:text-green-400 ring-green-200 dark:ring-green-900/40"
      : "bg-white dark:bg-zinc-900 text-red-800 dark:text-red-400 ring-red-200 dark:ring-red-900/40";

  return createPortal(
    <div role="status" aria-live="polite" aria-atomic="true" className={`${base} ${styles}`}>
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-0.5 text-current opacity-60 transition-opacity duration-[150ms] hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>
    </div>,
    container
  );
}

export interface ToastState {
  message: string;
  variant: "success" | "error";
}
