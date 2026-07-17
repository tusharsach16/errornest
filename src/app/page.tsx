import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardPreview from "@/components/DashboardPreview";
import { FEATURES } from "./components/home/featuresData";

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

export default function HomePage() {
  return (
    <>
      <Header />

      <main id="main-content">
        <section id="hero" aria-label="Hero" className="relative overflow-hidden">
          <div
            className="hero-dot-grid pointer-events-none absolute inset-0"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-[1280px] px-6 pb-24 pt-16">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="max-w-[540px]">
                <div className="animate-hero mb-6 inline-flex items-center gap-2 rounded-pill border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-800 dark:text-zinc-300">
                  <span aria-hidden="true" className="h-2 w-2 rounded-pill bg-zinc-900 dark:bg-zinc-100" />
                  Open-source error monitoring
                </div>

                <h1 className="animate-hero-delay text-3xl font-bold leading-tight tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.1]">
                  Stop finding bugs<br />
                  <span className="text-zinc-900 dark:text-zinc-100 underline decoration-zinc-200 dark:decoration-zinc-800 decoration-4 underline-offset-8">from user reports.</span>
                </h1>

                <p className="animate-hero-delay-2 mt-6 text-base leading-relaxed text-zinc-650 dark:text-zinc-350">
                  ErrorNest catches, fingerprints, and groups production errors
                  in real time — so your team knows before a ticket is filed.
                  Drop in your API key and see your first issue in seconds.
                </p>

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

                <p className="animate-hero-delay-2 mt-6 text-xs text-gray-400 dark:text-zinc-500">
                  No credit card required &middot; MIT licensed &middot; Self-hostable
                </p>
              </div>

              <div className="animate-hero-delay lg:pl-4">
                <p className="sr-only">
                  An animated dashboard showing three production errors arriving and being grouped into issues with occurrence counts.
                </p>
                <DashboardPreview />
              </div>
            </div>
          </div>
        </section>

        <section id="features" aria-label="Features" className="py-16">
          <div className="mx-auto max-w-[1280px] px-6">
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

            <ol
              className="grid gap-6 sm:grid-cols-3"
              aria-label="Feature list"
            >
              {FEATURES.map(({ number, title, description, Visual, Icon }) => (
                <li
                  key={number}
                  className="group flex flex-col gap-4 rounded-card border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm transition-all duration-[250ms] ease-out hover:border-zinc-400 dark:hover:border-zinc-700 hover:shadow-md"
                >
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

                  <div
                    aria-hidden="true"
                    className="rounded-[8px] border border-gray-100 dark:border-zinc-850 bg-[#F8F8FC] dark:bg-zinc-900/30 p-3"
                  >
                    <Visual />
                  </div>

                  <p className="text-sm leading-relaxed text-zinc-650 dark:text-zinc-350">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="docs"
          aria-label="Get started"
          className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-16"
        >
          <div className="mx-auto max-w-[600px] px-6 text-center">
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
