export function CommandPaletteFooter() {
  return (
    <div className="flex items-center gap-4 border-t border-gray-200 dark:border-zinc-800 px-4 py-2 text-[10px] text-zinc-400 dark:text-zinc-500">
      <span className="flex items-center gap-1">
        <kbd className="rounded border border-gray-200 dark:border-zinc-700 px-1 py-0.5 font-mono">↑↓</kbd>
        Navigate
      </span>
      <span className="flex items-center gap-1">
        <kbd className="rounded border border-gray-200 dark:border-zinc-700 px-1 py-0.5 font-mono">↵</kbd>
        Select
      </span>
      <span className="flex items-center gap-1">
        <kbd className="rounded border border-gray-200 dark:border-zinc-700 px-1 py-0.5 font-mono">ESC</kbd>
        Close
      </span>
    </div>
  );
}
