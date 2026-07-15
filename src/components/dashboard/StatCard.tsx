interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: "blue" | "red" | "amber" | "emerald";
  delay?: number;
}

const ICON_COLORS = {
  blue: "text-blue-500 dark:text-blue-400",
  red: "text-red-500 dark:text-red-400",
  amber: "text-amber-500 dark:text-amber-400",
  emerald: "text-emerald-500 dark:text-emerald-400",
} as const;

const RING_COLORS = {
  blue: "ring-blue-200/50 dark:ring-blue-800/30",
  red: "ring-red-200/50 dark:ring-red-800/30",
  amber: "ring-amber-200/50 dark:ring-amber-800/30",
  emerald: "ring-emerald-200/50 dark:ring-emerald-800/30",
} as const;

export default function StatCard({ label, value, icon, gradient, delay = 0 }: StatCardProps) {
  return (
    <div
      className={`
        stat-gradient-${gradient}
        relative overflow-hidden rounded-card
        border border-gray-200/60 dark:border-zinc-800/60
        p-5
        ring-1 ${RING_COLORS[gradient]}
        transition-all duration-250 ease-out
        hover:scale-[1.02] hover:shadow-lg
        active:scale-[0.98]
        animate-hero
        motion-reduce:hover:scale-100 motion-reduce:active:scale-100
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Decorative circle */}
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-white/5 to-transparent dark:from-white/[0.02]" />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 animate-count-up tabular-nums">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/60 dark:bg-zinc-800/40 ${ICON_COLORS[gradient]} shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
