import { createPortal } from "react-dom";
import type { SavedSearchItem } from "../ErrorsClient";
import { MiniSpinner } from "@/components/MiniSpinner";

interface SavedSearchesDropdownProps {
  savedSearches: SavedSearchItem[];
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  dropdownTriggerRef: React.RefObject<HTMLButtonElement>;
  dropdownRef: React.RefObject<HTMLDivElement>;
  dropdownPosition: { top: number; left: number } | null;
  isDeletingId: string | null;
  applySavedSearch: (s: SavedSearchItem) => void;
  handleDeleteSavedSearch: (id: string) => void;
  showSaveForm: boolean;
  setShowSaveForm: (show: boolean) => void;
  newSearchName: string;
  setNewSearchName: (name: string) => void;
  saveError: string | null;
  setSaveError: (err: string | null) => void;
  isSaving: boolean;
  handleSaveSearch: () => void;
  hasActiveFilters: boolean;
}

export function SavedSearchesDropdown({
  savedSearches,
  isDropdownOpen,
  setIsDropdownOpen,
  dropdownTriggerRef,
  dropdownRef,
  dropdownPosition,
  isDeletingId,
  applySavedSearch,
  handleDeleteSavedSearch,
  showSaveForm,
  setShowSaveForm,
  newSearchName,
  setNewSearchName,
  saveError,
  setSaveError,
  isSaving,
  handleSaveSearch,
  hasActiveFilters,
}: SavedSearchesDropdownProps) {
  return (
    <>
      {savedSearches.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          <button
            ref={dropdownTriggerRef}
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            className="inline-flex items-center gap-1.5 rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20"
            style={{ minHeight: "44px" }}
          >
            <span>Saved searches</span>
            <svg aria-hidden="true" className="h-4 w-4 opacity-60" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
          {isDropdownOpen && dropdownPosition && createPortal(
            <ul
              role="listbox"
              style={{ position: "fixed", top: dropdownPosition.top, left: dropdownPosition.left }}
              className="z-50 w-64 rounded-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl animate-scale-in focus:outline-none"
            >
              {savedSearches.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-input text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-150"
                >
                  <button
                    type="button"
                    onClick={() => {
                      applySavedSearch(s);
                      setIsDropdownOpen(false);
                    }}
                    className="flex-1 text-left px-3 py-2.5 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white focus:outline-none rounded-input truncate font-semibold"
                    style={{ minHeight: "44px" }}
                  >
                    {s.name}
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingId === s.id}
                    onClick={() => handleDeleteSavedSearch(s.id)}
                    aria-label={`Delete saved search ${s.name}`}
                    className="shrink-0 p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-input transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500 disabled:opacity-50"
                    style={{ minHeight: "44px", minWidth: "44px" }}
                  >
                    {isDeletingId === s.id ? (
                      <MiniSpinner />
                    ) : (
                      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>,
            document.body
          )}
        </div>
      )}

      {!showSaveForm ? (
        <button
          type="button"
          onClick={() => {
            setShowSaveForm(true);
            setNewSearchName("");
            setSaveError(null);
          }}
          disabled={!hasActiveFilters}
          className="inline-flex items-center gap-1.5 rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ minHeight: "44px" }}
        >
          <svg aria-hidden="true" className="h-4 w-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m-3-3h6" />
          </svg>
          <span>Save this search</span>
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newSearchName}
            onChange={(e) => {
              setNewSearchName(e.target.value);
              setSaveError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSaving && newSearchName.trim()) {
                e.preventDefault();
                handleSaveSearch();
              }
            }}
            placeholder="Search name…"
            disabled={isSaving}
            className="rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20"
            style={{ minHeight: "44px" }}
            autoFocus
          />
          <button
            type="button"
            onClick={handleSaveSearch}
            disabled={isSaving || !newSearchName.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-input bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-semibold text-white dark:text-zinc-950 shadow-sm transition-all duration-[150ms] hover:bg-black dark:hover:bg-white focus-visible:outline-none disabled:opacity-60"
            style={{ minHeight: "44px" }}
          >
            {isSaving && <MiniSpinner />}
            <span>Save</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowSaveForm(false);
              setNewSearchName("");
              setSaveError(null);
            }}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus-visible:outline-none disabled:opacity-60"
            style={{ minHeight: "44px" }}
          >
            Cancel
          </button>
          {saveError && (
            <span className="text-xs font-medium text-red-500 dark:text-red-400 ml-1">
              {saveError}
            </span>
          )}
        </div>
      )}
    </>
  );
}
