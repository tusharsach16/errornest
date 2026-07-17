import type { ReactNode } from "react";

interface CommandPaletteItemProps {
  item: {
    id: string;
    label: string;
    icon: ReactNode;
    action: () => void;
  };
  idx: number;
  activeIndex: number;
  setActiveIndex: (idx: number) => void;
}

export function CommandPaletteItem({
  item,
  idx,
  activeIndex,
  setActiveIndex,
}: CommandPaletteItemProps) {
  const isActive = idx === activeIndex;
  return (
    <button
      type="button"
      data-index={idx}
      onClick={item.action}
      onMouseEnter={() => setActiveIndex(idx)}
      className={`
        flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-100
        ${isActive
          ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        }
      `}
    >
      <span className={`shrink-0 ${isActive ? "text-indigo-500" : "text-zinc-400 dark:text-zinc-500"}`}>
        {item.icon}
      </span>
      <span className="truncate">{item.label}</span>
      {isActive && (
        <span className="ml-auto text-[10px] font-mono text-zinc-400 dark:text-zinc-500">↵</span>
      )}
    </button>
  );
}
