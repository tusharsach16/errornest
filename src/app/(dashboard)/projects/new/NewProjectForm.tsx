"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createProjectAction } from "../actions/create-project";
import type { CreateProjectState } from "../actions/create-project";

const initialState: CreateProjectState = {};

export function NewProjectForm() {
  const [state, dispatch] = useFormState(createProjectAction, initialState);

  if (state.result) {
    return (
      <ApiKeyReveal projectId={state.result.projectId} apiKey={state.result.apiKey} />
    );
  }

  return (
    <form action={dispatch} noValidate className="space-y-6">
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Project name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="off"
          placeholder="e.g. My App"
          aria-describedby={state.fieldError ? "name-error" : undefined}
          aria-invalid={!!state.fieldError}
          className="block w-full rounded-input border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
          style={{ minHeight: "44px" }}
        />
        {state.fieldError && (
          <p id="name-error" role="alert" className="text-xs text-red-600">
            {state.fieldError}
          </p>
        )}
      </div>

      {state.formError && (
        <p role="alert" className="rounded-input bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.formError}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function ApiKeyReveal({ projectId, apiKey }: { projectId: string; apiKey: string }) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    // Reset label after 2 s so users know they can copy again if needed.
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-amber-200 bg-amber-50 px-6 py-4">
        <p className="text-sm font-semibold text-amber-800">
          ⚠ Copy your API key now — it will not be shown again.
        </p>
        <p className="mt-1 text-xs text-amber-700">
          Store it in your environment variables. You cannot retrieve it later, only revoke and
          regenerate.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Your API key</p>
        <div className="flex items-stretch gap-2">
          <code className="flex-1 overflow-x-auto rounded-input border border-gray-300 bg-gray-50 px-3 py-3 font-mono text-sm text-gray-900">
            {apiKey}
          </code>
          <button
            type="button"
            onClick={copyToClipboard}
            className="shrink-0 rounded bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors duration-[150ms] hover:bg-indigo-700"
            style={{ minHeight: "44px" }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <Link
        href={`/projects/${projectId}`}
        className="inline-flex items-center gap-1 rounded bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-[150ms] hover:bg-indigo-700"
        style={{ minHeight: "44px" }}
      >
        Go to project →
      </Link>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex items-center gap-2 rounded bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-[150ms] hover:bg-indigo-700 disabled:opacity-60"
      style={{ minHeight: "44px" }}
    >
      {pending && <Spinner />}
      {pending ? "Creating…" : "Create project"}
    </button>
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
