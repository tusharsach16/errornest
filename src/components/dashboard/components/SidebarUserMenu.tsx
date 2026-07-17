import { signOut } from "next-auth/react";

interface SidebarUserMenuProps {
  userMenuRef: React.RefObject<HTMLDivElement>;
  userMenuOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
  collapsed: boolean;
  initial: string;
  displayName: string;
  userEmail: string | null;
}

export function SidebarUserMenu({
  userMenuRef,
  userMenuOpen,
  setUserMenuOpen,
  collapsed,
  initial,
  displayName,
  userEmail,
}: SidebarUserMenuProps) {
  return (
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
  );
}
