import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings · ErrorNest",
  description: "Manage your user profile and account settings.",
};

export default async function SettingsPage() {
  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      company: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const memberSince = user.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      {/* ── Title Heading ── */}
      <div className="space-y-1 animate-hero mb-8">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Account Settings
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Settings
        </h1>
      </div>

      <SettingsClient
        user={{
          name: user.name ?? "",
          email: user.email,
          company: user.company ?? "",
          bio: user.bio ?? "",
          memberSince,
        }}
      />
    </main>
  );
}
