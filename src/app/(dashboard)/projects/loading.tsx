export default function ProjectsLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-10 w-28 rounded-[10px] bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-card border border-gray-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 p-5 space-y-4">
            <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex justify-between items-center">
              <div className="h-8 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-10 w-10 rounded-[10px] bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 mb-4 flex justify-between items-center">
        <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-card border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="h-5 w-14 rounded-pill bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-8 w-full rounded bg-zinc-100 dark:bg-zinc-900/50" />
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-5 w-16 rounded-pill bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
