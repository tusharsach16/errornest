"use client";

import { useState } from "react";
import { listErrorEventsAction } from "./actions";
import type { SerializableErrorEvent } from "./actions";

interface Props {
  projectId: string;
  groupId: string;
  initialItems: SerializableErrorEvent[];
  initialNextCursor: string | null;
}

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
    <section aria-label="Error occurrences" className="mt-8 space-y-3 animate-hero" style={{ animationDelay: "240ms" }}>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
        Occurrences
        <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">
          ({items.length}{nextCursor ? "+" : ""} shown)
        </span>
      </h2>

      <ol className="space-y-3" aria-label="List of error occurrences">
        {items.map((event, idx) => (
          <EventCard key={event.id} event={event} index={idx} />
        ))}
      </ol>

      {loadError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {loadError}
        </p>
      )}

      {nextCursor && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            aria-busy={isLoadingMore}
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-zinc-900 dark:bg-zinc-100 px-6 py-2 text-sm font-semibold text-white dark:text-zinc-950 shadow-sm transition-all duration-[150ms] ease-out hover:bg-black dark:hover:bg-white hover:scale-[1.03] active:scale-[0.98] focus-visible:rounded-pill disabled:opacity-60 motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
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

const STACK_COLLAPSE_THRESHOLD = 10;

function EventCard({ event, index }: { event: SerializableErrorEvent; index: number }) {
  const stackLines = event.stackTrace?.split("\n") ?? [];
  const isLong = stackLines.length > STACK_COLLAPSE_THRESHOLD;

  return (
    <li
      className="rounded-card border border-zinc-200 dark:border-zinc-800 bg-[#FDFDFD] dark:bg-zinc-900/40 animate-hero shadow-sm overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="break-words font-semibold text-zinc-900 dark:text-zinc-100">{event.message}</p>

          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            {event.browser && (
              <div className="flex gap-1">
                <dt className="font-semibold text-zinc-600 dark:text-zinc-400">Browser</dt>
                <dd className="text-zinc-800 dark:text-zinc-300">{event.browser}</dd>
              </div>
            )}
            {event.url && (
              <div className="flex gap-1">
                <dt className="font-semibold text-zinc-600 dark:text-zinc-400">URL</dt>
                <dd className="max-w-[300px] truncate text-zinc-800 dark:text-zinc-300" title={event.url}>
                  {event.url}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <time
          dateTime={event.createdAt}
          className="shrink-0 whitespace-nowrap text-xs text-zinc-400 dark:text-zinc-500"
        >
          {relativeTime(event.createdAt)}
        </time>
      </div>

      {event.stackTrace && (
        <details className="border-t border-zinc-150 dark:border-zinc-800/80" open={!isLong}>
          <summary className="cursor-pointer select-none px-6 py-3 text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-650/40 dark:focus-visible:ring-indigo-500/40" style={{ minHeight: "44px", display: "flex", alignItems: "center" }}>
            {isLong ? "Show stack trace" : "Stack trace"}
          </summary>
          <pre className="overflow-x-auto bg-gray-950 px-6 py-4 font-mono text-xs leading-relaxed text-zinc-300 border-t border-zinc-800">
            {event.stackTrace}
          </pre>
        </details>
      )}

      {event.userContext && Object.keys(event.userContext).length > 0 && (
        <details className="border-t border-zinc-150 dark:border-zinc-800/80">
          <summary className="cursor-pointer select-none px-6 py-3 text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-650/40 dark:focus-visible:ring-indigo-500/40" style={{ minHeight: "44px", display: "flex", alignItems: "center" }}>
            User context
          </summary>
          <pre className="overflow-x-auto bg-gray-950 px-6 py-4 font-mono text-xs leading-relaxed text-zinc-300 border-t border-zinc-800">
            {JSON.stringify(event.userContext, null, 2)}
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