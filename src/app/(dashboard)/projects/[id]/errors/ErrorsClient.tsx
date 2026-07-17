"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { listErrorGroupsAction, saveSearchAction, deleteSearchAction } from "./actions";
import type { SerializableErrorGroup, ErrorStatus } from "./actions";
import { Toast } from "@/components/Toast";
import type { ToastState } from "@/components/Toast";
import { MiniSpinner } from "@/components/MiniSpinner";
import { SkeletonRows, EmptyNoErrors, EmptyNoMatches, ErrorState } from "./components/EmptyStates";
import { SavedSearchesDropdown } from "./components/SavedSearchesDropdown";
import { ErrorTableRow } from "./components/ErrorTableRow";

export type FilterStatus = "OPEN" | "RESOLVED" | "IGNORED" | "";
export type FilterSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL" | "";

export interface Filters {
  q: string;
  status: FilterStatus;
  severity: FilterSeverity;
}

type PageState = "loading" | "success" | "error";

export interface SavedSearchItem {
  id: string;
  name: string;
  filters: any;
}

interface Props {
  projectId: string;
  projectName: string;
  initialItems: SerializableErrorGroup[];
  initialNextCursor: string | null;
  initialFilters: Filters;
  initialSavedSearches: SavedSearchItem[];
}

export function ErrorsClient({
  projectId,
  projectName,
  initialItems,
  initialNextCursor,
  initialFilters,
  initialSavedSearches,
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

  const [savedSearches, setSavedSearches] = useState<SavedSearchItem[]>(initialSavedSearches);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const handleRowStatusChange = useCallback((groupId: string, next: ErrorStatus) => {
    setItems((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, status: next } : g)),
    );
  }, []);

  useEffect(() => {
    if (!isDropdownOpen) return;

    if (dropdownTriggerRef.current) {
      const rect = dropdownTriggerRef.current.getBoundingClientRect();
      setDropdownPosition({ top: rect.bottom + 8, left: rect.left });
    }

    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDropdownOpen]);

  const handleSaveSearch = async () => {
    const name = newSearchName.trim();
    if (!name) return;

    setIsSaving(true);
    setSaveError(null);

    const result = await saveSearchAction(projectId, name, filters);
    setIsSaving(false);

    if (!result.ok) {
      setSaveError(result.error);
      return;
    }

    setSavedSearches((prev) => [result.search, ...prev]);
    setShowSaveForm(false);
    setNewSearchName("");
    setToast({ message: "Search saved successfully", variant: "success" });
  };

  const handleDeleteSavedSearch = async (searchId: string) => {
    setIsDeletingId(searchId);

    const result = await deleteSearchAction(searchId);
    setIsDeletingId(null);

    if (!result.ok) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setSavedSearches((prev) => prev.filter((s) => s.id !== searchId));
    setToast({ message: "Saved search deleted", variant: "success" });
  };

  const applySavedSearch = (s: SavedSearchItem) => {
    const nextFilters: Filters = {
      q: s.filters?.q ?? "",
      status: (s.filters?.status as FilterStatus) ?? "",
      severity: (s.filters?.severity as FilterSeverity) ?? "",
    };
    setFilters(nextFilters);
    fetchFirstPage(nextFilters);
    setToast({ message: `Applied saved search "${s.name}"`, variant: "success" });
  };

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
          className="w-full rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 sm:w-64"
          style={{ minHeight: "44px" }}
        />

        <label className="sr-only" htmlFor="status-filter">
          Filter by status
        </label>
        <select
          id="status-filter"
          value={filters.status}
          onChange={(e) => handleDropdownChange("status", e.target.value)}
          className="rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20"
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
          className="rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20"
          style={{ minHeight: "44px" }}
        >
          <option value="">All severities</option>
          <option value="INFO">Info</option>
          <option value="WARNING">Warning</option>
          <option value="ERROR">Error</option>
          <option value="CRITICAL">Critical</option>
        </select>

        <SavedSearchesDropdown
          savedSearches={savedSearches}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          dropdownTriggerRef={dropdownTriggerRef}
          dropdownRef={dropdownRef}
          dropdownPosition={dropdownPosition}
          isDeletingId={isDeletingId}
          applySavedSearch={applySavedSearch}
          handleDeleteSavedSearch={handleDeleteSavedSearch}
          showSaveForm={showSaveForm}
          setShowSaveForm={setShowSaveForm}
          newSearchName={newSearchName}
          setNewSearchName={setNewSearchName}
          saveError={saveError}
          setSaveError={setSaveError}
          isSaving={isSaving}
          handleSaveSearch={handleSaveSearch}
          hasActiveFilters={hasActiveFilters}
        />
      </section>

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