import { useState, useTransition } from "react";
import type { MemberWithUser, AssignableRole } from "../actions";
import { inviteMemberAction } from "../actions";
import { MiniSpinner } from "@/components/MiniSpinner";

interface InviteFormProps {
  projectId: string;
  projectName: string;
  onSuccess: (member: MemberWithUser) => void;
  onToast: (t: { message: string; variant: "success" | "error" }) => void;
}

export function InviteForm({
  projectId,
  projectName,
  onSuccess,
  onToast,
}: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AssignableRole>("MEMBER");
  const [isPending, startTransition] = useTransition();
  const [noAccountEmail, setNoAccountEmail] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setNoAccountEmail(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError("Please enter an email address.");
      return;
    }

    startTransition(async () => {
      const result = await inviteMemberAction(projectId, trimmed, role);

      if (!result.ok) {
        if (result.noAccount) {
          setNoAccountEmail(trimmed);
        } else {
          onToast({ message: result.error, variant: "error" });
        }
        return;
      }

      setEmail("");
      setRole("MEMBER");
      onSuccess(result.member);
    });
  };

  return (
    <div className="rounded-card border border-zinc-200 dark:border-zinc-800 bg-[#FDFDFD] dark:bg-zinc-900/20 p-6 shadow-sm">
      <form onSubmit={handleSubmit} noValidate aria-label={`Invite member to ${projectName}`}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label
              htmlFor="invite-email"
              className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Email address
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldError(null);
                setNoAccountEmail(null);
              }}
              placeholder="colleague@example.com"
              autoComplete="email"
              disabled={isPending}
              style={{ minHeight: "44px" }}
              className="w-full rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 disabled:opacity-60"
            />
            {fieldError && (
              <p className="mt-1 text-xs text-red-650 dark:text-red-400" role="alert">{fieldError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="invite-role"
              className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as AssignableRole)}
              disabled={isPending}
              style={{ minHeight: "44px" }}
              className="rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-650 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 disabled:opacity-60"
            >
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            style={{ minHeight: "44px" }}
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 shadow-sm transition-all duration-[150ms] ease-out hover:bg-black dark:hover:bg-white hover:scale-[1.03] active:scale-[0.98] focus-visible:rounded-pill disabled:opacity-60 motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
          >
            {isPending && <MiniSpinner />}
            {isPending ? "Adding…" : "Add member"}
          </button>
        </div>
      </form>

      {noAccountEmail && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-input border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300"
        >
          <span className="font-semibold">{noAccountEmail}</span> doesn&apos;t have an
          ErrorNest account yet. They need to sign up at{" "}
          <span className="font-medium">errornest.app</span> with that email address first.
        </div>
      )}
    </div>
  );
}
