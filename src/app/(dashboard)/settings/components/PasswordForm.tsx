import { useState, useTransition } from "react";
import { changePasswordAction } from "../actions";
import { MiniSpinner } from "@/components/MiniSpinner";

interface PasswordFormProps {
  onToast: (t: { message: string; variant: "success" | "error" }) => void;
}

export function PasswordForm({ onToast }: PasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedCurrent || !trimmedNew || !trimmedConfirm) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (trimmedNew.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setPasswordError("New passwords do not match.");
      return;
    }

    startPasswordTransition(async () => {
      const result = await changePasswordAction(trimmedCurrent, trimmedNew);
      if (!result.ok) {
        setPasswordError(result.error);
        return;
      }
      onToast({ message: "Password updated successfully.", variant: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    });
  };

  return (
    <section aria-labelledby="security-heading">
      <div className="rounded-card border border-zinc-200 dark:border-zinc-800 bg-[#FDFDFD] dark:bg-zinc-900/20 p-6 shadow-sm transition-all duration-[250ms] hover:border-zinc-300 dark:hover:border-zinc-700">
        <div className="mb-6">
          <h2 id="security-heading" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Change Password
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Ensure your account is using a secure password.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
          {passwordError && (
            <div role="alert" className="rounded-input border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-800 dark:text-red-300">
              {passwordError}
            </div>
          )}

          <div>
            <label htmlFor="current-password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isPasswordPending}
              required
              className="w-full rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 disabled:opacity-60"
              style={{ minHeight: "44px" }}
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isPasswordPending}
              required
              className="w-full rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 disabled:opacity-60"
              style={{ minHeight: "44px" }}
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isPasswordPending}
              required
              className="w-full rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 disabled:opacity-60"
              style={{ minHeight: "44px" }}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPasswordPending}
              className="inline-flex items-center justify-center gap-2 rounded-pill bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 shadow-sm transition-all duration-[150ms] ease-out hover:bg-black dark:hover:bg-white hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
              style={{ minHeight: "44px" }}
            >
              {isPasswordPending ? <MiniSpinner className="h-3.5 w-3.5" strokeWidth={2.5} /> : null}
              {isPasswordPending ? "Updating password..." : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
