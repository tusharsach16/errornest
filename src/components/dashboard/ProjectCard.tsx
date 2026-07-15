import Link from "next/link";
import Sparkline from "./Sparkline";

interface ProjectCardProps {
  id: string;
  name: string;
  createdAt: Date;
  errorCount24h: number;
  worstSeverity: "INFO" | "WARNING" | "ERROR" | "CRITICAL" | null;
  dailyCounts: number[];
  index: number;
}

const SEVERITY_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  CRITICAL: {
    bg: "bg-red-100 dark:bg-red-950/50 ring-1 ring-red-300 dark:ring-red-800",
    text: "text-red-700 dark:text-red-300 font-semibold",
    label: "CRITICAL",
  },
  ERROR: {
    bg: "bg-red-50 dark:bg-red-950/30 ring-1 ring-red-200 dark:ring-red-900/50",
    text: "text-red-600 dark:text-red-400",
    label: "ERROR",
  },
  WARNING: {
    bg: "bg-amber-50 dark:bg-amber-950/30 ring-1 ring-amber-200 dark:ring-amber-900/50",
    text: "text-amber-600 dark:text-amber-400",
    label: "WARNING",
  },
  INFO: {
    bg: "bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-200 dark:ring-blue-900/50",
    text: "text-blue-600 dark:text-blue-400",
    label: "INFO",
  },
};

export default function ProjectCard({
  id,
  name,
  createdAt,
  errorCount24h,
  worstSeverity,
  dailyCounts,
  index,
}: ProjectCardProps) {
  const sevBadge = worstSeverity ? SEVERITY_BADGE[worstSeverity] : null;
  const hasActivity = dailyCounts.some((c) => c > 0);

  return (
    <li
      className="animate-hero"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Link
        href={`/projects/${id}`}
        className="
          group relative block rounded-card overflow-hidden
          border border-gray-200/80 dark:border-zinc-800/80
          bg-white dark:bg-zinc-900/40
          shadow-sm
          transition-all duration-250 ease-out
          hover:shadow-xl hover:scale-[1.02] hover:border-zinc-300 dark:hover:border-zinc-700
          hover-glow
          active:scale-[0.98]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
          motion-reduce:hover:scale-100 motion-reduce:active:scale-100
        "
      >
        {/* Top gradient accent bar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 opacity-60 group-hover:opacity-100 transition-opacity duration-250" />

        <div className="p-5">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="live-dot h-2 w-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {name}
              </p>
            </div>
            {sevBadge && (
              <span className={`shrink-0 inline-flex items-center rounded-pill px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sevBadge.bg} ${sevBadge.text}`}>
                {sevBadge.label}
              </span>
            )}
          </div>

          {/* Sparkline */}
          <div className="mt-3">
            {hasActivity ? (
              <Sparkline data={dailyCounts} height={32} />
            ) : (
              <div className="flex h-8 items-center justify-center">
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">No activity</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
              Created{" "}
              {new Date(createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <div className="flex items-center gap-1.5">
              {errorCount24h > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-pill bg-red-50 dark:bg-red-950/30 px-2 py-0.5 text-[10px] font-bold tabular-nums text-red-600 dark:text-red-400 ring-1 ring-red-200/50 dark:ring-red-900/30">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errorCount24h} today
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-pill bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-200/50 dark:ring-emerald-900/30">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Clean
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hover gradient overlay */}
        <div className="absolute inset-0 rounded-card bg-gradient-to-br from-indigo-500/0 via-transparent to-purple-500/0 group-hover:from-indigo-500/[0.02] group-hover:to-purple-500/[0.02] transition-all duration-300 pointer-events-none" />
      </Link>
    </li>
  );
}
