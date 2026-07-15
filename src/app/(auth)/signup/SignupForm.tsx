"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signupAction } from "../actions/signup";
import type { SignupState } from "../actions/signup";

const initialState: SignupState = {};

export function SignupForm() {
  const [state, dispatch] = useFormState(signupAction, initialState);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-4 transition-colors duration-[150ms]"
          >
            Log in
          </Link>
        </p>
      </div>

      {state.formError && (
        <p role="alert" className="rounded-input border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-800 dark:text-red-300">
          {state.formError}
        </p>
      )}

      <form action={dispatch} noValidate className="space-y-6">
        <Field
          id="name"
          label="Full name"
          type="text"
          name="name"
          autoComplete="name"
          error={state.fieldErrors?.name}
        />
        <Field
          id="email"
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          error={state.fieldErrors?.email}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          hint="Minimum 8 characters"
          error={state.fieldErrors?.password}
        />

        <SubmitButton />
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
  hint?: string;
  error?: string;
};

function Field({ id, label, type, name, autoComplete, hint, error }: FieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

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
        aria-describedby={
          [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined
        }
        aria-invalid={!!error}
        className="block w-full rounded-input border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-3 text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 transition-colors duration-[150ms] hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20"
        style={{ minHeight: "44px" }}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      )}
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="flex w-full items-center justify-center gap-2 rounded-pill bg-zinc-900 dark:bg-zinc-100 px-4 py-3 text-sm font-semibold text-white dark:text-zinc-950 shadow-sm transition-all duration-[150ms] ease-out hover:bg-black dark:hover:bg-white hover:scale-[1.02] active:scale-[0.98] focus-visible:rounded-pill disabled:opacity-60 motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
    >
      {pending && <Spinner />}
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}
