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
  // Track whether this is the very first render to skip a redundant fetch.
  const isFirstRender = useRef(true);

  const hasActiveFilters = filters.q !== "" || filters.status !== "" || filters.severity !== "";

  // Push current filter state into the URL (replaces history entry to keep back nav clean).
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
        return;
      }

      setItems(result.items);
      setNextCursor(result.nextCursor);
      setPageState("success");
    },
    [projectId, syncUrl],
  );

  // Debounce only the search input; dropdowns fire immediately.
  const handleSearchChange = (value: string) => {
    const next = { ...filters, q: value };
    setFilters(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchFirstPage(next), 300);
  };

  const handleDropdownChange = (key: "status" | "severity", value: string) => {
    const next = { ...filters, [key]: value } as Filters;
    setFilters(next);
    fetchFirstPage(next);
  };

  const handleReset = () => {
    const reset: Filters = { q: "", status: "", severity: "" };
    setFilters(reset);
    fetchFirstPage(reset);
  };

  const handleRetry = () => fetchFirstPage(filters);

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

    if (!result.ok) return;

    setItems((prev) => [...prev, ...result.items]);
    setNextCursor(result.nextCursor);
    // Mirror the new cursor in the URL so refreshing resumes from the same place.
    syncUrl(filters, result.nextCursor);
  };

  // Skip fetch on mount — server already provided initialItems.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
  }, []);

  // Cleanup debounce on unmount.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const isLoading = pageState === "loading" || isPending;

  return (
    <div className="mt-8 space-y-6">
      {/* ── Filters ──────────────────────────────────────────────── */}
      <section aria-label="Filters" className="flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="error-search">
          Search errors
        </label>
        <input
          id="error-search"
          type="search"
          value={filters.q}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search errors…"
          className="w-full rounded-input border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 sm:w-64"
          style={{ minHeight: "44px" }}
        />

        <label className="sr-only" htmlFor="status-filter">
          Filter by status
        </label>
        <select
          id="status-filter"
          value={filters.status}
          onChange={(e) => handleDropdownChange("status", e.target.value)}
          className="rounded-input border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
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
          className="rounded-input border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
          style={{ minHeight: "44px" }}
        >
          <option value="">All severities</option>
          <option value="INFO">Info</option>
          <option value="WARNING">Warning</option>
          <option value="ERROR">Error</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </section>

      {/* ── Content area ─────────────────────────────────────────── */}
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
          <div className="overflow-x-auto rounded-card border border-gray-200">
            <table
              className="min-w-full divide-y divide-gray-200 text-sm"
              aria-label="Error groups"
            >
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-gray-600"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-gray-600"
                  >
                    Severity
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-semibold text-gray-600"
                  >
                    Occurrences
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-gray-600"
                  >
                    Last seen
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-gray-600"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-gray-600"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
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
            <div className="flex justify-center pt-2">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                aria-busy={isLoadingMore}
                className="inline-flex items-center gap-2 rounded bg-white border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 transition-colors duration-[150ms] hover:bg-gray-50 disabled:opacity-60"
                style={{ minHeight: "44px" }}
              >
                {isLoadingMore && <Spinner />}
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
    <tr className="relative transition-colors duration-[150ms] hover:bg-gray-50">
      <td className="max-w-[360px] px-4 py-3">
        <Link
          href={href}
          className="block truncate font-medium text-gray-900 after:absolute after:inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-600/40"
          title={group.title}
        >
          {group.title}
        </Link>
      </td>
      <td className="px-4 py-3">
        <SeverityBadge severity={group.severity} />
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-gray-700">
        {group.occurrenceCount.toLocaleString()}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-gray-500">
        {relativeTime(group.lastSeenAt)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={status} />
      </td>
      {/* z-10 lifts buttons above the <Link> after:inset-0 overlay */}
      <td className="relative z-10 px-4 py-3">
        <div className="flex items-center gap-2" role="group" aria-label={`Actions for ${group.title}`}>
          {status === "OPEN" ? (
            <>
              <RowActionButton label="Resolve" isPending={isPending} onClick={() => handleAction("RESOLVED")} colorClass="text-green-700 border-green-300 hover:bg-green-50 active:bg-green-100 focus-visible:ring-green-500/40" />
              <RowActionButton label="Ignore" isPending={isPending} onClick={() => handleAction("IGNORED")} colorClass="text-gray-600 border-gray-300 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-400/40" />
            </>
          ) : (
            <RowActionButton label="Reopen" isPending={isPending} onClick={() => handleAction("OPEN")} colorClass="text-indigo-700 border-indigo-300 hover:bg-indigo-50 active:bg-indigo-100 focus-visible:ring-indigo-600/30" />
          )}
        </div>
      </td>
    </tr>
  );
}

const SEVERITY_CLASSES: Record<SerializableErrorGroup["severity"], string> = {
  INFO: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  WARNING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  ERROR: "bg-red-50 text-red-700 ring-1 ring-red-200",
  CRITICAL: "bg-red-100 text-red-800 ring-1 ring-red-300 font-semibold",
};

function SeverityBadge({ severity }: { severity: SerializableErrorGroup["severity"] }) {
  return (
    <span
      className={`inline-block rounded-pill px-2 py-0.5 text-xs ${SEVERITY_CLASSES[severity]}`}
    >
      {severity}
    </span>
  );
}

const STATUS_CLASSES: Record<SerializableErrorGroup["status"], string> = {
  OPEN: "bg-red-50 text-red-700 ring-1 ring-red-200",
  RESOLVED: "bg-green-50 text-green-700 ring-1 ring-green-200",
  IGNORED: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
};

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
      className={`inline-flex items-center gap-1 rounded border bg-white px-2.5 py-1 text-xs font-semibold transition-colors duration-[150ms] focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${colorClass}`}
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

function StatusBadge({ status }: { status: SerializableErrorGroup["status"] }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span
      className={`inline-block rounded-pill px-2 py-0.5 text-xs ${STATUS_CLASSES[status]}`}
    >
      {label}
    </span>
  );
}

function SkeletonRows() {
  return (
    <div className="overflow-x-auto rounded-card border border-gray-200" aria-busy="true" aria-label="Loading errors">
      <table className="min-w-full divide-y divide-gray-200 text-sm" aria-hidden="true">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Severity</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">Occurrences</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Last seen</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {Array.from({ length: 8 }, (_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="px-4 py-3">
                <div className="h-4 w-72 rounded bg-gray-200" />
              </td>
              <td className="px-4 py-3">
                <div className="h-5 w-16 rounded-pill bg-gray-200" />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="ml-auto h-4 w-10 rounded bg-gray-200" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-24 rounded bg-gray-200" />
              </td>
              <td className="px-4 py-3">
                <div className="h-5 w-16 rounded-pill bg-gray-200" />
              </td>
              <td className="px-4 py-3">
                <div className="h-5 w-28 rounded bg-gray-200" />
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
    <div className="mt-4 rounded-card border border-dashed border-indigo-200 bg-indigo-50 px-8 py-12 text-center">
      <p className="text-lg font-semibold text-indigo-900">
        No errors captured yet for {projectName}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-indigo-700">
        Send your first error using your API key. Here&apos;s a quick curl example:
      </p>

      <div className="relative mx-auto mt-6 max-w-xl text-left">
        <pre className="overflow-x-auto rounded-card bg-gray-900 px-4 py-4 font-mono text-xs leading-relaxed text-gray-100">
          {snippet}
        </pre>
        <button
          onClick={copy}
          className="absolute right-3 top-3 rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white transition-colors duration-[150ms] hover:bg-indigo-700"
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
    <div className="mt-4 rounded-card border border-gray-200 bg-gray-50 px-8 py-12 text-center">
      <p className="text-base font-semibold text-gray-700">No errors match your filters</p>
      <p className="mt-1 text-sm text-gray-500">
        Try adjusting your search or removing a filter.
      </p>
      <button
        onClick={onReset}
        className="mt-6 inline-flex items-center rounded border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition-colors duration-[150ms] hover:bg-gray-100"
        style={{ minHeight: "44px" }}
      >
        Reset filters
      </button>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-4 rounded-card border border-red-200 bg-red-50 px-8 py-12 text-center">
      <p className="text-base font-semibold text-red-800">
        Something went wrong loading errors
      </p>
      <p className="mt-1 text-sm text-red-600">
        This is likely a temporary issue. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center rounded bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors duration-[150ms] hover:bg-red-700"
        style={{ minHeight: "44px" }}
      >
        Retry
      </button>
    </div>
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
