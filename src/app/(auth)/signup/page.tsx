import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Create your ErrorNest account — Sign up free",
  description:
    "Sign up for ErrorNest to start monitoring production errors in minutes. Get real-time alerts, smart grouping, and team collaboration — free to get started.",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <SignupForm />
    </main>
  );
}
