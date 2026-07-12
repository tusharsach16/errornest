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
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
