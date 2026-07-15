"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";

interface SidebarProps {
  userName: string | null;
  userEmail: string | null;
}

const STORAGE_KEY = "errornest-sidebar-collapsed";

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      localStorage.setItem(STORAGE_KEY, String(!prev));
      return !prev;
    });
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const initial = (userName || userEmail || "U")[0]?.toUpperCase() ?? "U";
  const displayName = userName || userEmail || "User";
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  const navItems = [
    {
      label: "Dashboard",
      href: "/projects",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
        </svg>
      ),
      active: pathname === "/projects",
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      active: false,
      disabled: true,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 py-6">
        <Link
          href="/projects"
          className="flex items-center gap-2.5 transition-all duration-150 hover:opacity-85"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold select-none shadow-lg shadow-indigo-500/20">
            E
          </span>
          {!collapsed && (
            <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap overflow-hidden">
              Error<span className="text-zinc-500 dark:text-zinc-400">Nest</span>
            </span>
          )}
        </Link>
        {/* Collapse toggle — desktop only */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all duration-150"
        >
          <svg className={`h-4 w-4 transition-transform duration-250 ${collapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M11 19l-7-7 7-7" />
            <path d="M17 19l-7-7 7-7" opacity={0.4} />
          </svg>
        </button>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />

      {/* ── Nav items ── */}
      <nav className="mt-4 flex-1 space-y-1 px-3" aria-label="Sidebar navigation">
        {navItems.map((item) => {
          const isActive = item.active;
          const baseClasses =
            "group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150";
          const activeClasses = isActive
            ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 shadow-sm"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200";
          const disabledClasses = item.disabled
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : "";

          return (
            <div key={item.label} className="relative">
              {item.disabled ? (
                <span className={`${baseClasses} ${activeClasses} ${disabledClasses}`}>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-indigo-500" />
                  )}
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      <span className="ml-auto text-[9px] uppercase tracking-wider font-bold bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 dark:text-zinc-400">
                        Soon
                      </span>
                    </>
                  )}
                </span>
              ) : (
                <Link href={item.href} className={`${baseClasses} ${activeClasses}`}>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-indigo-500" />
                  )}
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )}
              {/* Tooltip when collapsed */}
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-900 dark:bg-zinc-100 px-2.5 py-1 text-xs font-medium text-white dark:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-50">
                  {item.label}
                  {item.disabled && " (Coming Soon)"}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Bottom section ── */}
      <div className="mt-auto space-y-2 px-3 pb-4">
        {/* Divider */}
        <div className="mx-1 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="group relative flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all duration-150"
        >
          <span className="shrink-0">
            {mounted && resolvedTheme === "dark" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </span>
          {!collapsed && <span className="truncate">{mounted && resolvedTheme === "dark" ? "Light mode" : "Dark mode"}</span>}
          {collapsed && (
            <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-900 dark:bg-zinc-100 px-2.5 py-1 text-xs font-medium text-white dark:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-50">
              Toggle theme
            </span>
          )}
        </button>

        {/* User menu */}
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="group relative flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all duration-150"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold select-none">
              {initial}
            </span>
            {!collapsed && (
              <>
                <span className="truncate text-zinc-700 dark:text-zinc-300 max-w-[140px]">{displayName}</span>
                <svg
                  className={`ml-auto h-4 w-4 text-zinc-400 transition-transform duration-150 ${userMenuOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20" fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </>
            )}
            {collapsed && (
              <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-900 dark:bg-zinc-100 px-2.5 py-1 text-xs font-medium text-white dark:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-50">
                {displayName}
              </span>
            )}
          </button>

          {/* User dropdown */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-[10px] border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-xl z-50 animate-scale-in">
              <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {userEmail}
              </div>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-150"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-[10px] border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md lg:hidden transition-all duration-150 hover:scale-105 active:scale-95"
      >
        <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm sidebar-overlay lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 z-[56] h-screen
          border-r border-gray-200 dark:border-zinc-800/80
          bg-white/80 dark:bg-zinc-950/90 backdrop-blur-xl
          sidebar-transition overflow-hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:sticky
          ${collapsed ? "lg:w-[72px]" : "lg:w-[260px]"}
          w-[260px]
        `}
        aria-label="Main navigation"
      >
        {/* Gradient accent line on left edge */}
        <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-indigo-500 via-purple-500 to-blue-500 opacity-60" />
        {sidebarContent}
      </aside>
    </>
  );
}
