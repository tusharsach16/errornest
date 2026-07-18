"use client";

import { useState, useEffect } from "react";

interface IntegrationOnboardingProps {
  projectName: string;
  apiKey?: string;
}

export function IntegrationOnboarding({ projectName, apiKey = "YOUR_API_KEY" }: IntegrationOnboardingProps) {
  const [activeTab, setActiveTab] = useState<"curl" | "nodejs" | "react">("curl");
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("https://errornest.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const endpoint = `${origin}/api/errors/ingest`;

  const snippets = {
    curl: `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: ${apiKey}" \\
  -d '{
    "message": "Test error message",
    "severity": "ERROR",
    "stack": "Error: Test error\\n    at Object.run (index.js:5:10)"
  }'`,
    nodejs: `// 1. Create a helper file (e.g., errornest.js)
async function captureError(error, severity = "ERROR") {
  try {
    await fetch("${endpoint}", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "${apiKey}",
      },
      body: JSON.stringify({
        message: error.message || String(error),
        severity: severity,
        stack: error.stack || "",
        url: typeof window !== "undefined" ? window.location.href : "server-side",
      }),
    });
  } catch (err) {
    console.error("Failed to send error to ErrorNest:", err);
  }
}

// 2. Wrap your operations or register unhandled rejections
process.on("unhandledRejection", (reason) => {
  captureError(reason instanceof Error ? reason : new Error(String(reason)), "CRITICAL");
});`,
    react: `// components/ErrorBoundary.jsx
import React from "react";

export class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    fetch("${endpoint}", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "${apiKey}",
      },
      body: JSON.stringify({
        message: error.message || String(error),
        severity: "CRITICAL",
        stack: error.stack || "",
        context: {
          componentStack: errorInfo?.componentStack
        }
      }),
    }).catch((err) => console.error("ErrorNest notification failed:", err));
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 text-center rounded-card border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/10">
          <h2 className="text-red-800 dark:text-red-300 font-bold">Something went wrong.</h2>
          <p className="text-sm text-red-650 dark:text-red-400 mt-1">This error has been logged automatically.</p>
        </div>
      );
    }
    return this.props.children;
  }
}`
  };

  const copy = async () => {
    await navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple, robust syntax highlighting for key tokens to make it look premium
  const highlightCode = (code: string, tab: typeof activeTab) => {
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };

    // Split code by comments and strings to highlight them independently
    const parts = code.split(/(\/\/.*)|("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\$]*(?:\\.[^`\\$]*)*`)/g);

    return parts
      .map((part) => {
        if (!part) return "";

        // Is it a comment?
        if (part.startsWith("//")) {
          return `<span class="text-zinc-550 dark:text-zinc-500 italic">${escapeHtml(part)}</span>`;
        }

        // Is it a string?
        if (
          (part.startsWith('"') && part.endsWith('"')) ||
          (part.startsWith("'") && part.endsWith("'")) ||
          (part.startsWith("`") && part.endsWith("`"))
        ) {
          return `<span class="text-emerald-600 dark:text-emerald-400">${escapeHtml(part)}</span>`;
        }

        // Otherwise, it is standard code/text:
        let escaped = escapeHtml(part);

        if (tab === "curl") {
          escaped = escaped
            .replace(/(curl -X POST)/g, '<span class="text-indigo-600 dark:text-indigo-400 font-semibold">$1</span>')
            .replace(/(-H|-d)/g, '<span class="text-zinc-500 dark:text-zinc-400 font-medium">$1</span>');
          return escaped;
        }

        // JS/TS Keywords
        escaped = escaped.replace(
          /\b(async|await|try|catch|const|let|function|class|extends|import|from|export|return|static|state|process|on)\b/g,
          '<span class="text-indigo-600 dark:text-indigo-400 font-semibold">$1</span>'
        );

        // Booleans and Null
        escaped = escaped.replace(
          /\b(true|false|null)\b/g,
          '<span class="text-amber-600 dark:text-amber-500 font-medium">$1</span>'
        );

        return escaped;
      })
      .join("");
  };

  return (
    <div className="mt-6 rounded-card border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 px-6 py-8 text-center max-w-2xl mx-auto shadow-sm animate-hero">
      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
        No errors captured yet for {projectName}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        Send your first error using your API key. Select an integration method below to get started:
      </p>

      {/* Tabs */}
      <div className="mt-6 flex justify-center border-b border-zinc-200 dark:border-zinc-850">
        <div className="flex gap-2">
          {(["curl", "nodejs", "react"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCopied(false);
              }}
              className={`pb-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-[150ms] ${
                activeTab === tab
                  ? "border-indigo-650 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {tab === "curl" && "cURL"}
              {tab === "nodejs" && "Node.js (Fetch)"}
              {tab === "react" && "React / Next.js"}
            </button>
          ))}
        </div>
      </div>

      {/* Code Display Area */}
      <div className="relative mt-6 text-left">
        <pre className="overflow-x-auto rounded-card bg-zinc-950 border border-zinc-850 px-5 py-5 font-mono text-xs leading-relaxed text-zinc-300">
          <code
            dangerouslySetInnerHTML={{
              __html: highlightCode(snippets[activeTab], activeTab),
            }}
          />
        </pre>

        {/* Copy Button */}
        <button
          onClick={copy}
          className="absolute right-3 top-3 rounded-pill bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold px-3 py-1.5 transition-all duration-[150ms] hover:bg-black dark:hover:bg-white hover:scale-[1.02] active:scale-[0.98] shadow flex items-center gap-1.5"
          style={{ minHeight: "28px" }}
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
