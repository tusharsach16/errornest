import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in to ErrorNest — Monitor your errors",
  description:
    "Sign in to your ErrorNest account to view real-time error groups, manage your projects, and keep your production apps running smoothly.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      {/* Suspense required because LoginForm reads useSearchParams() */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
