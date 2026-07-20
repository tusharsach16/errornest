"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/lib/validators/auth.validators";
import { OAuthButtons, OAuthDivider } from "../components/OAuthButtons";

type FieldErrors = Partial<Record<"email" | "password", string>>;

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "An account with this email already exists. Sign in with your original method, then link this provider from settings.",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("created") === "1";
  const oauthError = searchParams.get("error");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const raw = { email: data.get("email"), password: data.get("password") };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    startTransition(async () => {
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        setFormError("Incorrect email or password.");
      } else {
        window.location.href = "/projects";
      }
    });
  }

  const oauthErrorMessage = oauthError ? OAUTH_ERROR_MESSAGES[oauthError] : null;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Sign in to ErrorNest
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-4 transition-colors duration-[150ms]"
          >
            Sign up
          </Link>
        </p>
      </div>

      {justCreated && (
        <p role="status" className="rounded-input border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30 px-4 py-3 text-sm text-green-800 dark:text-green-300">
          Account created! Sign in to get started.
        </p>
      )}

      {oauthErrorMessage && (
        <p role="alert" className="rounded-input border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          {oauthErrorMessage}
        </p>
      )}

      {formError && (
        <p role="alert" className="rounded-input border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-800 dark:text-red-300">
          {formError}
        </p>
      )}

      <OAuthButtons />
      <OAuthDivider />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Field
          id="login-email"
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          error={fieldErrors.email}
        />
        <Field
          id="login-password"
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          error={fieldErrors.password}
        />

        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-pill bg-zinc-900 dark:bg-zinc-100 px-4 py-3 text-sm font-semibold text-white dark:text-zinc-950 shadow-sm transition-all duration-[150ms] ease-out hover:bg-black dark:hover:bg-white hover:scale-[1.02] active:scale-[0.98] focus-visible:rounded-pill disabled:opacity-60 motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
          style={{ minHeight: "44px" }}
        >
          {isPending && <Spinner />}
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  name: string;
  autoComplete?: string;
  error?: string;
};

function Field({ id, label, type, name, autoComplete, error }: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        className="block w-full rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-3 text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20"
        style={{ minHeight: "44px" }}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3a9 9 0 0 1 9 9"
        className="opacity-25"
      />
      <circle cx="12" cy="12" r="9" strokeOpacity={0.25} />
    </svg>
  );
}
