import { useState } from "react";
import { IntegrationOnboarding } from "@/components/dashboard/IntegrationOnboarding";

export function SkeletonRows() {
  return (
    <div className="overflow-x-auto rounded-card border border-gray-200 dark:border-zinc-800 bg-[#FDFDFD] dark:bg-zinc-900/20" aria-busy="true" aria-label="Loading errors">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm" aria-hidden="true">
        <thead className="bg-zinc-50 dark:bg-zinc-900/60">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-zinc-500 dark:text-zinc-400">Title</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-500 dark:text-zinc-400">Severity</th>
            <th className="px-4 py-3 text-right font-semibold text-zinc-500 dark:text-zinc-400">Occurrences</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-500 dark:text-zinc-400">Last seen</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-500 dark:text-zinc-400">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-500 dark:text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/80 bg-white dark:bg-zinc-900/10">
          {Array.from({ length: 8 }, (_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="px-4 py-3">
                <div className="h-4 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />
              </td>
              <td className="px-4 py-3">
                <div className="h-5 w-16 rounded-pill bg-zinc-200 dark:bg-zinc-800" />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="ml-auto h-4 w-10 rounded bg-zinc-200 dark:bg-zinc-800" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
              </td>
              <td className="px-4 py-3">
                <div className="h-5 w-16 rounded-pill bg-zinc-200 dark:bg-zinc-800" />
              </td>
              <td className="px-4 py-3">
                <div className="h-5 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyNoErrors({ projectName }: { projectName: string }) {
  return <IntegrationOnboarding projectName={projectName} />;
}

export function EmptyNoMatches({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-4 rounded-card border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20 px-8 py-12 text-center max-w-xl mx-auto shadow-sm animate-hero">
      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No errors match your filters</p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Try adjusting your search or removing a filter.
      </p>
      <button
        onClick={onReset}
        className="mt-6 inline-flex items-center justify-center rounded-pill bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 shadow-sm transition-all duration-[150ms] ease-out hover:bg-black dark:hover:bg-white hover:scale-[1.03] active:scale-[0.98] focus-visible:rounded-pill motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
        style={{ minHeight: "44px" }}
      >
        Reset filters
      </button>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-4 rounded-card border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-8 py-12 text-center max-w-xl mx-auto shadow-sm animate-hero">
      <p className="text-lg font-bold text-red-800 dark:text-red-300">
        Something went wrong loading errors
      </p>
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
        This is likely a temporary issue. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center justify-center rounded-pill bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-[150ms] ease-out hover:bg-red-700 hover:scale-[1.03] active:scale-[0.98] focus-visible:rounded-pill motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
        style={{ minHeight: "44px" }}
      >
        Retry
      </button>
    </div>
  );
}
