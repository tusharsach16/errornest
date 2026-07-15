export default function ProjectDetailLoading() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-12 animate-pulse space-y-8">
      <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />

      <div className="flex gap-4 border-b border-gray-200 dark:border-zinc-800 pb-px">
        <div className="h-8 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="space-y-4">
        <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-64 rounded-card border border-zinc-250 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/10 p-6" />
      </div>

      <div className="space-y-4">
        <div className="h-4 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="rounded-card border border-gray-200 dark:border-zinc-800 bg-[#FDFDFD] dark:bg-zinc-900/20 divide-y divide-gray-150 dark:divide-zinc-800/80 shadow-sm overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-6 w-6 rounded bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-5 w-12 rounded-pill bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
