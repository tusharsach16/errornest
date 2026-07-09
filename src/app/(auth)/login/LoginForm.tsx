"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/lib/validators/auth.validators";

type FieldErrors = Partial<Record<"email" | "password", string>>;

export function LoginForm() {
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("created") === "1";

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
        window.location.href = "/dashboard";
      }
    });
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Sign in to ErrorNest
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline"
          >
            Create one free
          </Link>
        </p>
      </div>

      {justCreated && (
        <p role="status" className="rounded-input bg-green-50 px-4 py-3 text-sm text-green-700">
          Account created! Sign in to get started.
        </p>
      )}

      {formError && (
        <p role="alert" className="rounded-input bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Field
          id="email"
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          error={fieldErrors.email}
        />
        <Field
          id="password"
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
          className="flex w-full items-center justify-center gap-2 rounded bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors duration-[150ms] hover:bg-indigo-700 disabled:opacity-60"
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
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        className="block w-full rounded-input border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
        style={{ minHeight: "44px" }}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
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
