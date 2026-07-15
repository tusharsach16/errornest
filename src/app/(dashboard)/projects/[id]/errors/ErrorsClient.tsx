"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { listErrorGroupsAction, updateErrorStatusAction } from "./actions";
import type { SerializableErrorGroup, ErrorStatus } from "./actions";
import { Toast } from "@/components/Toast";
import type { ToastState } from "@/components/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FilterStatus = "OPEN" | "RESOLVED" | "IGNORED" | "";
export type FilterSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL" | "";

interface Filters {
  q: string;
  status: FilterStatus;
  severity: FilterSeverity;
}

type PageState = "loading" | "success" | "error";

// ─── Main client component ────────────────────────────────────────────────────

interface Props {
  projectId: string;
  projectName: string;
  initialItems: SerializableErrorGroup[];
  initialNextCursor: string | null;
  initialFilters: Filters;
}

type ToastCallback = (t: ToastState) => void;

export function ErrorsClient({
  projectId,
  projectName,
  initialItems,
  initialNextCursor,
  initialFilters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [items, setItems] = useState<SerializableErrorGroup[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [pageState, setPageState] = useState<PageState>("success");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const handleRowStatusChange = useCallback((groupId: string, next: ErrorStatus) => {
    setItems((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, status: next } : g)),
    );
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const hasActiveFilters = filters.q !== "" || filters.status !== "" || filters.severity !== "";

  const syncUrl = useCallback(
    (f: Filters, cursor?: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      f.q ? params.set("q", f.q) : params.delete("q");
      f.status ? params.set("status", f.status) : params.delete("status");
      f.severity ? params.set("severity", f.severity) : params.delete("severity");
      cursor ? params.set("cursor", cursor) : params.delete("cursor");

      startTransition(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams],
  );

  const fetchFirstPage = useCallback(
    async (f: Filters) => {
      setPageState("loading");
      setNextCursor(null);
      syncUrl(f, null);

      const result = await listErrorGroupsAction(projectId, {
        search: f.q || undefined,
        status: (f.status as SerializableErrorGroup["status"]) || undefined,
        severity: (f.severity as SerializableErrorGroup["severity"]) || undefined,
      });

      if (!result.ok) {
        setPageState("error");
        setItems([]);
        return;
      }

      setItems(result.items);
      setNextCursor(result.nextCursor);
      setPageState("success");
    },
    [projectId, syncUrl],
  );

  const handleSearchChange = (q: string) => {
    const next = { ...filters, q };
    setFilters(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchFirstPage(next);
    }, 300);
  };

  const handleDropdownChange = (key: "status" | "severity", val: string) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    fetchFirstPage(next);
  };

  const handleReset = () => {
    const next = { q: "", status: "" as const, severity: "" as const };
    setFilters(next);
    fetchFirstPage(next);
  };

  const handleRetry = () => {
    fetchFirstPage(filters);
  };

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    const result = await listErrorGroupsAction(projectId, {
      search: filters.q || undefined,
      status: (filters.status as SerializableErrorGroup["status"]) || undefined,
      severity: (filters.severity as SerializableErrorGroup["severity"]) || undefined,
      cursor: nextCursor,
    });

    setIsLoadingMore(false);

    if (!result.ok) {
      setToast({ message: "Failed to load more errors.", variant: "error" });
      return;
    }

    setItems((prev) => [...prev, ...result.items]);
    setNextCursor(result.nextCursor);
    syncUrl(filters, result.nextCursor);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const isLoading = pageState === "loading" || isPending;

  return (
    <div className="mt-8 space-y-6">
      {/* ── Filters ── */}
      <section aria-label="Filters" className="flex flex-wrap items-center gap-3 animate-hero" style={{ animationDelay: "40ms" }}>
        <label className="sr-only" htmlFor="error-search">
          Search errors
        </label>
        <input
          id="error-search"
          type="search"
          value={filters.q}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search errors…"
          className="w-full rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 sm:w-64"
          style={{ minHeight: "44px" }}
        />

        <label className="sr-only" htmlFor="status-filter">
          Filter by status
        </label>
        <select
          id="status-filter"
          value={filters.status}
          onChange={(e) => handleDropdownChange("status", e.target.value)}
          className="rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-750 dark:text-zinc-300 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20"
          style={{ minHeight: "44px" }}
        >
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="RESOLVED">Resolved</option>
          <option value="IGNORED">Ignored</option>
        </select>

        <label className="sr-only" htmlFor="severity-filter">
          Filter by severity
        </label>
        <select
          id="severity-filter"
          value={filters.severity}
          onChange={(e) => handleDropdownChange("severity", e.target.value)}
          className="rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-750 dark:text-zinc-300 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20"
          style={{ minHeight: "44px" }}
        >
          <option value="">All severities</option>
          <option value="INFO">Info</option>
          <option value="WARNING">Warning</option>
          <option value="ERROR">Error</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </section>

      {/* ── Content area ── */}
      {isLoading ? (
        <SkeletonRows />
      ) : pageState === "error" ? (
        <ErrorState onRetry={handleRetry} />
      ) : items.length === 0 && !hasActiveFilters ? (
        <EmptyNoErrors projectName={projectName} />
      ) : items.length === 0 ? (
        <EmptyNoMatches onReset={handleReset} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-card border border-gray-200 dark:border-zinc-800 bg-[#FDFDFD] dark:bg-zinc-900/20 shadow-sm animate-hero" style={{ animationDelay: "80ms" }}>
            <table
              className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm"
              aria-label="Error groups"
            >
              <thead className="bg-zinc-50 dark:bg-zinc-900/60">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400"
                  >
                    Severity
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-semibold text-zinc-600 dark:text-zinc-400"
                  >
                    Occurrences
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400"
                  >
                    Last seen
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/80 bg-white dark:bg-zinc-900/10">
                {items.map((group) => (
                  <ErrorTableRow
                    key={group.id}
                    group={group}
                    projectId={projectId}
                    onStatusChange={handleRowStatusChange}
                    onToast={setToast}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {nextCursor && (
            <div className="flex justify-center pt-2 animate-hero" style={{ animationDelay: "140ms" }}>
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                aria-busy={isLoadingMore}
                className="inline-flex items-center justify-center gap-2 rounded-pill bg-zinc-900 dark:bg-zinc-100 px-6 py-2 text-sm font-semibold text-white dark:text-zinc-950 shadow-sm transition-all duration-[150ms] ease-out hover:bg-black dark:hover:bg-white hover:scale-[1.03] active:scale-[0.98] focus-visible:rounded-pill disabled:opacity-60 motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
                style={{ minHeight: "44px" }}
              >
                {isLoadingMore && <MiniSpinner />}
                {isLoadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ErrorTableRow({
  group,
  projectId,
  onStatusChange,
  onToast,
}: {
  group: SerializableErrorGroup;
  projectId: string;
  onStatusChange: (groupId: string, next: ErrorStatus) => void;
  onToast: ToastCallback;
}) {
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
          className="block truncate font-medium text-zinc-900 dark:text-zinc-100 after:absolute after:inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-650/40 dark:focus-visible:ring-indigo-500/40"
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
              colorClass="bg-white dark:bg-zinc-900 border-indigo-300 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 active:bg-indigo-100 dark:active:bg-indigo-950/40 focus-visible:ring-indigo-650/40"
            />
          )}
        </div>
      </td>
    </tr>
  );
}

const SEVERITY_CLASSES: Record<SerializableErrorGroup["severity"], string> = {
  INFO: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900/50",
  WARNING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/50",
  ERROR: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-900/50",
  CRITICAL: "bg-red-100 text-red-800 ring-1 ring-red-300 font-semibold dark:bg-red-900/40 dark:text-red-200 dark:ring-red-800",
};

function SeverityBadge({
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

function StatusBadge({ status }: { status: SerializableErrorGroup["status"] }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span
      className={`inline-block rounded-pill px-2 py-0.5 text-xs font-semibold ${STATUS_CLASSES[status]}`}
    >
      {label}
    </span>
  );
}

function SkeletonRows() {
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

function EmptyNoErrors({ projectName }: { projectName: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = `curl -X POST https://errornest.app/api/errors/ingest \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: YOUR_API_KEY" \\
  -d '{"message":"Test error","severity":"ERROR"}'`;

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 rounded-card border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20 px-8 py-12 text-center max-w-xl mx-auto shadow-sm animate-hero">
      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
        No errors captured yet for {projectName}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        Send your first error using your API key. Here&apos;s a quick curl example:
      </p>

      <div className="relative mx-auto mt-6 max-w-xl text-left">
        <pre className="overflow-x-auto rounded-card bg-zinc-950 border border-zinc-800 px-4 py-4 font-mono text-xs leading-relaxed text-zinc-300">
          {snippet}
        </pre>
        <button
          onClick={copy}
          className="absolute right-3 top-3 rounded-pill bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold px-4 py-1.5 transition-all duration-[150ms] hover:bg-black dark:hover:bg-white"
          style={{ minHeight: "28px" }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function EmptyNoMatches({ onReset }: { onReset: () => void }) {
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

function ErrorState({ onRetry }: { onRetry: () => void }) {
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

function MiniSpinner() {
  return (
    <svg aria-hidden="true" className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 0 1 9 9" className="opacity-25" />
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
