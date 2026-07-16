import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardPreview from "@/components/DashboardPreview";

export const metadata: Metadata = {
  title: "ErrorNest — Catch production errors before your users do",
  description:
    "ErrorNest groups, tracks, and alerts on real errors from your app in real time. Fingerprint-based deduplication, role-based team access, one-line integration — free to start.",
  openGraph: {
    title: "ErrorNest — Catch production errors before your users do",
    description:
      "Fingerprint-based grouping, real-time dashboard, role-based access. Drop in your API key and see your first error group in seconds.",
    type: "website",
  },
};

/* ─────────────────────────────────────────────────────────
   Feature mini-visuals
   Each demonstrates ONE real capability with a small, concrete UI
   element — not a generic icon + paragraph.
───────────────────────────────────────────────────────── */

/** Shows how 847 identical errors collapse into a single counted group */
function GroupingVisual() {
  return (
    <div className="space-y-2">
      {/* Individual events coming in */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="font-mono">→</span>
        <span className="font-mono text-zinc-500">POST /ingest</span>
        <span className="font-mono text-red-400 truncate">
          TypeError: null
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="font-mono">→</span>
        <span className="font-mono text-zinc-500">POST /ingest</span>
        <span className="font-mono text-red-400 truncate">
          TypeError: null
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="font-mono">→</span>
        <span className="font-mono text-zinc-500">POST /ingest</span>
        <span className="font-mono text-red-400 truncate">
          TypeError: null
        </span>
      </div>
      {/* Arrow → one group */}
      <div className="flex items-center gap-2 pt-1">
        <div className="h-px flex-1 border-t border-dashed border-gray-200 dark:border-zinc-800" />
        <span className="text-xs text-gray-400">grouped as</span>
        <div className="h-px flex-1 border-t border-dashed border-gray-200 dark:border-zinc-800" />
      </div>
      <div className="flex items-center justify-between rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-3 py-2">
        <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200">
          TypeError: null
        </span>
        <span className="rounded-pill bg-zinc-900 dark:bg-zinc-100 px-2 py-0.5 font-mono text-xs font-bold text-white dark:text-zinc-950">
          ×847
        </span>
      </div>
    </div>
  );
}

/** Shows the four role tiers with server-enforcement note */
function RbacVisual() {
  const roles = [
    { name: "you",   role: "Owner",  color: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-750" },
    { name: "alice", role: "Admin",  color: "bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-900" },
    { name: "bob",   role: "Member", color: "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900" },
    { name: "carol", role: "Viewer", color: "bg-gray-100 dark:bg-zinc-800/40 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800" },
  ] as const;

  return (
    <div className="space-y-2">
      {roles.map(({ name, role, color }) => (
        <div key={name} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-6 w-6 items-center justify-center rounded-pill bg-gray-100 dark:bg-zinc-800 font-mono text-xs font-semibold text-gray-500 dark:text-zinc-400"
            >
              {name[0]?.toUpperCase()}
            </span>
            <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">{name}</span>
          </div>
          <span
            className={`rounded-pill border px-2 py-0.5 text-xs font-semibold ${color}`}
          >
            {role}
          </span>
        </div>
      ))}
      <p className="pt-1 font-mono text-[10px] text-gray-400 dark:text-zinc-500">
        ✓ enforced server-side on every mutation
      </p>
    </div>
  );
}

/** Shows the actual curl command — the full integration surface */
function IntegrationVisual() {
  return (
    <div className="rounded-[8px] border border-gray-200 dark:border-zinc-800 bg-gray-950 p-3 font-mono text-xs leading-relaxed">
      <div className="mb-2 text-gray-600"># send your first error</div>
      <div>
        <span className="text-zinc-500">$ </span>
        <span className="text-zinc-400">curl</span>
        <span className="text-gray-300"> -X POST \</span>
      </div>
      <div>
        <span className="text-gray-600">    </span>
        <span className="text-zinc-500">errornest.dev</span>
        <span className="text-gray-400">/api/errors/ingest \</span>
      </div>
      <div>
        <span className="text-gray-600">  -H </span>
        <span className="text-amber-300">&quot;x-api-key: EN_sk_…&quot;</span>
        <span className="text-gray-500"> \</span>
      </div>
      <div>
        <span className="text-gray-600">  -d </span>
        <span className="text-green-400">
          &apos;&#123;&quot;message&quot;:&quot;RangeError…&quot;&#125;&apos;
        </span>
      </div>
      <div className="mt-2 text-green-400">✓ grouped as 1 issue</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Feature Icons (inline SVGs)
───────────────────────────────────────────────────────── */
function IconGrouping() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function IconRbac() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconIntegration() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

const FEATURES = [
  {
    number: "01",
    title: "Fingerprint grouping",
    description:
      "Each inbound error is hashed by message + top stack frame. Duplicates collapse into one issue with an incrementing counter — not 847 separate alerts.",
    Visual: GroupingVisual,
    Icon: IconGrouping,
  },
  {
    number: "02",
    title: "Role-based team access",
    description:
      "Invite as Owner, Admin, Member, or Viewer. Permissions are checked server-side on every mutation — the client is never trusted.",
    Visual: RbacVisual,
    Icon: IconRbac,
  },
  {
    number: "03",
    title: "Zero-SDK integration",
    description:
      "A single POST request with your project API key. No library to install, no agent to run — works from any language, any CI step, any runtime.",
    Visual: IntegrationVisual,
    Icon: IconIntegration,
  },
] as const;

/* ─────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <Header />

      <main id="main-content">
        {/* ══════════════════════════════════════════════════
            Hero — split layout: copy left / dashboard right
        ══════════════════════════════════════════════════ */}
        <section id="hero" aria-label="Hero" className="relative overflow-hidden">
          {/* Dot-grid texture layer */}
          <div
            className="hero-dot-grid pointer-events-none absolute inset-0"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-[1280px] px-6 pb-24 pt-16">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

              {/* ── Left: copy ── */}
              <div className="max-w-[540px]">
                {/* Eyebrow */}
                <div className="animate-hero mb-6 inline-flex items-center gap-2 rounded-pill border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-800 dark:text-zinc-300">
                  <span aria-hidden="true" className="h-2 w-2 rounded-pill bg-zinc-900 dark:bg-zinc-100" />
                  Open-source error monitoring
                </div>

                {/* H1 */}
                <h1 className="animate-hero-delay text-3xl font-bold leading-tight tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.1]">
                  Stop finding bugs<br />
                  <span className="text-zinc-900 dark:text-zinc-100 underline decoration-zinc-200 dark:decoration-zinc-800 decoration-4 underline-offset-8">from user reports.</span>
                </h1>

                {/* Subhead — darkened by one shade for better visual weight */}
                <p className="animate-hero-delay-2 mt-6 text-base leading-relaxed text-zinc-650 dark:text-zinc-350">
                  ErrorNest catches, fingerprints, and groups production errors
                  in real time — so your team knows before a ticket is filed.
                  Drop in your API key and see your first issue in seconds.
                </p>

                {/* CTAs with hover scale transitions */}
                <div className="animate-hero-delay-2 mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/signup"
                    id="hero-cta-primary"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-pill bg-zinc-900 dark:bg-zinc-100 px-8 py-3 text-sm font-semibold text-white dark:text-zinc-950 shadow-sm transition-all duration-[150ms] ease-out hover:bg-black dark:hover:bg-white hover:scale-[1.03] active:scale-[0.98] focus-visible:rounded-pill motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
                  >
                    Get started free
                    <svg
                      aria-hidden="true"
                      className="ml-2 h-4 w-4"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </Link>
                  <a
                    href="#features"
                    id="hero-cta-secondary"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-pill border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-8 py-3 text-sm font-semibold text-zinc-600 dark:text-zinc-400 shadow-sm transition-all duration-[150ms] ease-out hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white hover:scale-[1.03] active:scale-[0.98] focus-visible:rounded-pill motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
                  >
                    See how it works
                  </a>
                </div>

                {/* Trust strip */}
                <p className="animate-hero-delay-2 mt-6 text-xs text-gray-400 dark:text-zinc-500">
                  No credit card required &middot; MIT licensed &middot; Self-hostable
                </p>
              </div>

              {/* ── Right: animated dashboard preview ── */}
              <div className="animate-hero-delay lg:pl-4">
                {/* Screen-reader description of the animation */}
                <p className="sr-only">
                  An animated dashboard showing three production errors arriving and being grouped into issues with occurrence counts.
                </p>
                <DashboardPreview />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            Features — 3-col with concrete mini-visuals
        ══════════════════════════════════════════════════ */}
        <section id="features" aria-label="Features" className="py-16">
          <div className="mx-auto max-w-[1280px] px-6">
            {/* Section header */}
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                What it does
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-[2rem]">
                Signal, not noise
              </h2>
              <p className="mx-auto mt-3 max-w-[440px] text-sm text-zinc-650 dark:text-zinc-350">
                Three capabilities that turn raw error ingestion into actionable insight.
              </p>
            </div>

            {/* 3-col feature grid */}
            <ol
              className="grid gap-6 sm:grid-cols-3"
              aria-label="Feature list"
            >
              {FEATURES.map(({ number, title, description, Visual, Icon }) => (
                <li
                  key={number}
                  className="group flex flex-col gap-4 rounded-card border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm transition-all duration-[250ms] ease-out hover:border-zinc-400 dark:hover:border-zinc-700 hover:shadow-md"
                >
                  {/* Icon + Number + title */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden="true"
                        className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-transform duration-[150ms] ease-out group-hover:scale-[1.08] group-hover:rotate-[3deg] motion-reduce:group-hover:transform-none"
                      >
                        <Icon />
                      </div>
                      <h3 className="text-sm font-semibold text-ink">{title}</h3>
                    </div>
                    <span
                      aria-hidden="true"
                      className="font-mono text-xs font-semibold text-zinc-400 dark:text-zinc-500 tabular-nums"
                    >
                      {number}
                    </span>
                  </div>

                  {/* Mini visual */}
                  <div
                    aria-hidden="true"
                    className="rounded-[8px] border border-gray-100 dark:border-zinc-850 bg-[#F8F8FC] dark:bg-zinc-900/30 p-3"
                  >
                    <Visual />
                  </div>

                  {/* Description — darkened by one shade for better visual weight */}
                  <p className="text-sm leading-relaxed text-zinc-650 dark:text-zinc-350">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            Bottom CTA
        ══════════════════════════════════════════════════ */}
        <section
          id="docs"
          aria-label="Get started"
          className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-16"
        >
          <div className="mx-auto max-w-[600px] px-6 text-center">
            {/* Accent bracket decoration */}
            <p
              aria-hidden="true"
              className="mb-4 font-mono text-2xl font-light text-zinc-200 dark:text-zinc-800 select-none"
            >
              &#x7B;&nbsp;&#x7D;
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-[2rem]">
              Ready to ship with confidence?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-650 dark:text-zinc-350">
              Create a free account, drop in your API key, and your first error
              group will be waiting in the dashboard — no setup wizard required.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                id="bottom-cta-primary"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-pill bg-zinc-900 dark:bg-zinc-100 px-8 py-3 text-sm font-semibold text-white dark:text-zinc-950 shadow-sm transition-all duration-[150ms] ease-out hover:bg-black dark:hover:bg-white hover:scale-[1.03] active:scale-[0.98] focus-visible:rounded-pill sm:w-auto motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
              >
                Get started free
              </Link>
              <Link
                href="/login"
                id="bottom-cta-login"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-pill border border-gray-200 dark:border-zinc-800 bg-[#F8F8FC] dark:bg-zinc-900 px-8 py-3 text-sm font-semibold text-zinc-600 dark:text-zinc-400 shadow-sm transition-all duration-[150ms] ease-out hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-ink dark:hover:text-white hover:scale-[1.03] active:scale-[0.98] focus-visible:rounded-pill sm:w-auto motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
              >
                Log in
              </Link>
            </div>

            {/* Micro-copy */}
            <p className="mt-6 font-mono text-xs text-gray-400 dark:text-zinc-500">
              Free forever for solo developers &middot; Team plans scale with you
            </p>
          </div>
        </section>
      </main>

      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ErrorNest",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
          }),
        }}
      />
    </>
  );
}
