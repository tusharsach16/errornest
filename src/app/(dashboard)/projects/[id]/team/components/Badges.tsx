const ROLE_BADGE_CLASSES: Record<string, string> = {
  OWNER: "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:ring-indigo-900/50",
  ADMIN: "bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:ring-violet-900/50",
  MEMBER: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900/50",
  VIEWER: "bg-gray-100 text-gray-600 ring-1 ring-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700",
};

export function RoleBadge({ role }: { role: string }) {
  const label = role.charAt(0) + role.slice(1).toLowerCase();
  return (
    <span
      className={`inline-block rounded-pill px-2 py-0.5 text-xs font-semibold ${ROLE_BADGE_CLASSES[role] ?? ""}`}
    >
      {label}
    </span>
  );
}
