import Link from "next/link";
import type { ReactNode } from "react";

interface SidebarNavItemProps {
  item: {
    label: string;
    href: string;
    icon: ReactNode;
    active: boolean;
    disabled?: boolean;
  };
  collapsed: boolean;
}

export function SidebarNavItem({ item, collapsed }: SidebarNavItemProps) {
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
    <div className="relative">
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
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-900 dark:bg-zinc-100 px-2.5 py-1 text-xs font-medium text-white dark:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-50">
          {item.label}
          {item.disabled && " (Coming Soon)"}
        </span>
      )}
    </div>
  );
}
