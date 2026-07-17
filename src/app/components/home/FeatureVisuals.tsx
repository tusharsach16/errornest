export function GroupingVisual() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="font-mono">→</span>
        <span className="font-mono text-zinc-500">POST /ingest</span>
        <span className="font-mono text-red-400 truncate">
          TypeError: null
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="font-mono">→</span>
        <span className="font-mono text-zinc-500">POST /ingest</span>
        <span className="font-mono text-red-400 truncate">
          TypeError: null
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="font-mono">→</span>
        <span className="font-mono text-zinc-500">POST /ingest</span>
        <span className="font-mono text-red-400 truncate">
          TypeError: null
        </span>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <div className="h-px flex-1 border-t border-dashed border-gray-200 dark:border-zinc-800" />
        <span className="text-xs text-gray-400">grouped as</span>
        <div className="h-px flex-1 border-t border-dashed border-gray-200 dark:border-zinc-800" />
      </div>
      <div className="flex items-center justify-between rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-3 py-2">
        <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200">
          TypeError: null
        </span>
        <span className="rounded-pill bg-zinc-900 dark:bg-zinc-100 px-2 py-0.5 font-mono text-xs font-bold text-white dark:text-zinc-950">
          ×847
        </span>
      </div>
    </div>
  );
}

export function RbacVisual() {
  const roles = [
    { name: "you", role: "Owner", color: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-750" },
    { name: "alice", role: "Admin", color: "bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-900" },
    { name: "bob", role: "Member", color: "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900" },
    { name: "carol", role: "Viewer", color: "bg-gray-100 dark:bg-zinc-800/40 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800" },
  ] as const;

  return (
    <div className="space-y-2">
      {roles.map(({ name, role, color }) => (
        <div key={name} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-6 w-6 items-center justify-center rounded-pill bg-gray-100 dark:bg-zinc-800 font-mono text-xs font-semibold text-gray-500 dark:text-zinc-400"
            >
              {name[0]?.toUpperCase()}
            </span>
            <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">{name}</span>
          </div>
          <span
            className={`rounded-pill border px-2 py-0.5 text-xs font-semibold ${color}`}
          >
            {role}
          </span>
        </div>
      ))}
      <p className="pt-1 font-mono text-[10px] text-gray-400 dark:text-zinc-500">
        ✓ enforced server-side on every mutation
      </p>
    </div>
  );
}

export function IntegrationVisual() {
  return (
    <div className="rounded-[8px] border border-gray-200 dark:border-zinc-800 bg-gray-950 p-3 font-mono text-xs leading-relaxed">
      <div className="mb-2 text-gray-600"># send your first error</div>
      <div>
        <span className="text-zinc-500">$ </span>
        <span className="text-zinc-400">curl</span>
        <span className="text-gray-300"> -X POST \</span>
      </div>
      <div>
        <span className="text-gray-600">    </span>
        <span className="text-zinc-500">errornest.dev</span>
        <span className="text-gray-400">/api/errors/ingest \</span>
      </div>
      <div>
        <span className="text-gray-600">  -H </span>
        <span className="text-amber-300">&quot;x-api-key: EN_sk_…&quot;</span>
        <span className="text-gray-500"> \</span>
      </div>
      <div>
        <span className="text-gray-600">  -d </span>
        <span className="text-green-400">
          &apos;&#123;&quot;message&quot;:&quot;RangeError…&quot;&#125;&apos;
        </span>
      </div>
      <div className="mt-2 text-green-400">✓ grouped as 1 issue</div>
    </div>
  );
}
