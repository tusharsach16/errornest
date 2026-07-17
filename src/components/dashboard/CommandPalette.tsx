"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { CommandPaletteItem } from "./components/CommandPaletteItem";
import { CommandPaletteFooter } from "./components/CommandPaletteFooter";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  projects: { id: string; name: string }[];
}

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  section: string;
  action: () => void;
}

export default function CommandPalette({ open, onClose, projects }: CommandPaletteProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items: CommandItem[] = useMemo(() => {
    const navItems: CommandItem[] = [
      {
        id: "nav-dashboard",
        label: "Go to Dashboard",
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
          </svg>
        ),
        section: "Navigation",
        action: () => { router.push("/projects"); onClose(); },
      },
      {
        id: "nav-new",
        label: "Create New Project",
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path d="M12 4v16m8-8H4" />
          </svg>
        ),
        section: "Navigation",
        action: () => { router.push("/projects/new"); onClose(); },
      },
    ];

    const projectItems: CommandItem[] = projects.map((p) => ({
      id: `project-${p.id}`,
      label: p.name,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      section: "Projects",
      action: () => { router.push(`/projects/${p.id}`); onClose(); },
    }));

    const actionItems: CommandItem[] = [
      {
        id: "action-theme",
        label: resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        icon: resolvedTheme === "dark" ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ),
        section: "Actions",
        action: () => { setTheme(resolvedTheme === "dark" ? "light" : "dark"); onClose(); },
      },
      {
        id: "action-logout",
        label: "Log Out",
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        ),
        section: "Actions",
        action: () => { signOut({ callbackUrl: "/login" }); onClose(); },
      },
    ];

    return [...navItems, ...projectItems, ...actionItems];
  }, [projects, resolvedTheme, router, onClose, setTheme]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const lower = query.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(lower));
  }, [items, query]);

  const sections = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      if (!map.has(item.section)) map.set(item.section, []);
      map.get(item.section)!.push(item);
    }
    return map;
  }, [filtered]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        filtered[activeIndex].action();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [filtered, activeIndex, onClose],
  );

  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  let flatIndex = 0;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh]">
        <div
          role="dialog"
          aria-label="Command palette"
          className="w-full max-w-lg rounded-[16px] border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-scale-in"
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center gap-3 border-b border-gray-200 dark:border-zinc-800 px-4 py-3">
            <svg className="h-5 w-5 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search…"
              className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="hidden sm:inline-flex rounded-md border border-gray-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-400">
              ESC
            </kbd>
          </div>

          <div ref={listRef} className="max-h-[320px] overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No results for &ldquo;{query}&rdquo;
              </div>
            ) : (
              Array.from(sections.entries()).map(([section, sectionItems]) => (
                <div key={section}>
                  <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    {section}
                  </p>
                  {sectionItems.map((item) => {
                    const idx = flatIndex++;
                    return (
                      <CommandPaletteItem
                        key={item.id}
                        item={item}
                        idx={idx}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex}
                      />
                    );
                  })}
                </div>
              ))
            )}
          </div>

          <CommandPaletteFooter />
        </div>
      </div>
    </>
  );
}
