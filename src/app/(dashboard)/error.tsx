"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard error boundary]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md rounded-card border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 p-6 sm:p-8 shadow-lg backdrop-blur-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <svg className="h-7 w-7 text-red-650 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.834-2.694-.834-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-zinc-650 dark:text-zinc-400">
          An unexpected error occurred while loading this page.
        </p>
        
        {error.message && (
          <p className="mt-4 font-mono text-xs rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 p-3 max-h-24 overflow-y-auto break-words">
            {error.message}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row justify-center">
          <button
            onClick={reset}
            className="inline-flex min-h-[44px] items-center justify-center rounded-pill bg-zinc-900 dark:bg-zinc-100 px-6 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 shadow-sm transition-all duration-[150ms] ease-out hover:bg-black dark:hover:bg-white hover:scale-[1.02] active:scale-[0.98]"
          >
            Try again
          </button>
          <Link
            href="/projects"
            className="inline-flex min-h-[44px] items-center justify-center rounded-pill border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 shadow-sm transition-all duration-[150ms] ease-out hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-ink dark:hover:text-white hover:scale-[1.02] active:scale-[0.98]"
          >
            Go back to Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
