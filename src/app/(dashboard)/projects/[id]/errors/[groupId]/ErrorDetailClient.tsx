"use client";

import { useState } from "react";
import Link from "next/link";
import { listErrorEventsAction } from "./actions";
import type { SerializableErrorEvent } from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  projectId: string;
  groupId: string;
  initialItems: SerializableErrorEvent[];
  initialNextCursor: string | null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ErrorDetailClient({
  projectId,
  groupId,
  initialItems,
  initialNextCursor,
}: Props) {
  const [items, setItems] = useState<SerializableErrorEvent[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadError(null);

    const result = await listErrorEventsAction(projectId, groupId, nextCursor);
    setIsLoadingMore(false);

    if (!result.ok) {
      setLoadError("Failed to load more events. Please try again.");
      return;
    }

    setItems((prev) => [...prev, ...result.items]);
    setNextCursor(result.nextCursor);
  };

  return (
    <section aria-label="Error occurrences" className="mt-8 space-y-3">
      <h2 className="text-base font-semibold text-gray-900">
        Occurrences
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({items.length}{nextCursor ? "+" : ""} shown)
        </span>
      </h2>

      <ol className="space-y-3" aria-label="List of error occurrences">
        {items.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </ol>

      {loadError && (
        <p role="alert" className="text-sm text-red-600">
          {loadError}
        </p>
      )}

      {nextCursor && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            aria-busy={isLoadingMore}
            className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 transition-colors duration-[150ms] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 disabled:opacity-60"
            style={{ minHeight: "44px" }}
          >
            {isLoadingMore && <Spinner />}
            {isLoadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const STACK_COLLAPSE_THRESHOLD = 10;

function EventCard({ event }: { event: SerializableErrorEvent }) {
  const stackLines = event.stackTrace?.split("\n") ?? [];
  const isLong = stackLines.length > STACK_COLLAPSE_THRESHOLD;

  return (
    <li className="rounded-card border border-gray-200 bg-white">
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="break-words font-medium text-gray-900">{event.message}</p>

          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
            {event.browser && (
              <div className="flex gap-1">
                <dt className="font-medium text-gray-600">Browser</dt>
                <dd>{event.browser}</dd>
              </div>
            )}
            {event.url && (
              <div className="flex gap-1">
                <dt className="font-medium text-gray-600">URL</dt>
                <dd className="max-w-[300px] truncate" title={event.url}>
                  {event.url}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <time
          dateTime={event.createdAt}
          className="shrink-0 whitespace-nowrap text-xs text-gray-400"
        >
          {relativeTime(event.createdAt)}
        </time>
      </div>

      {event.stackTrace && (
        <details className="border-t border-gray-100" open={!isLong}>
          <summary className="cursor-pointer select-none px-4 py-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-600/30" style={{ minHeight: "44px", display: "flex", alignItems: "center" }}>
            {isLong ? "Show stack trace" : "Stack trace"}
          </summary>
          <pre className="overflow-x-auto bg-gray-950 px-4 py-3 font-mono text-xs leading-relaxed text-gray-200 rounded-b-card">
            {event.stackTrace}
          </pre>
        </details>
      )}
    </li>
  );
}

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3a9 9 0 0 1 9 9"
        className="opacity-25"
      />
      <circle cx="12" cy="12" r="9" strokeOpacity={0.25} />
    </svg>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// Re-export for use in page.tsx skeleton
export { Spinner };