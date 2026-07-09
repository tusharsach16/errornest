"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signupAction } from "../actions/signup";
import type { SignupState } from "../actions/signup";

const initialState: SignupState = {};

export function SignupForm() {
  const [state, dispatch] = useFormState(signupAction, initialState);

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      {state.formError && (
        <p role="alert" className="rounded-input bg-red-50 px-4 py-3 text-sm text-red-700">
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
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
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
        className="block w-full rounded-input border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
        style={{ minHeight: "44px" }}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="flex w-full items-center justify-center gap-2 rounded bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors duration-[150ms] hover:bg-indigo-700 disabled:opacity-60"
    >
      {pending && <Spinner />}
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}
