"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getServerUserId } from "@/lib/session";
import { db } from "@/lib/db";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "@/lib/validators/profile.validators";

export async function updateProfileAction(
  name: string,
  company: string | null | undefined,
  bio: string | null | undefined,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await getServerUserId();
  if (!userId) {
    redirect("/login");
  }

  const parsed = updateProfileSchema.safeParse({ name, company, bio });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid fields" };
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.name,
        company: parsed.data.company,
        bio: parsed.data.bio,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update profile. Please try again." };
  }
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await getServerUserId();
  if (!userId) {
    redirect("/login");
  }

  const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid fields" };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      return { ok: false, error: "Unable to complete password change." };
    }

    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!isValid) {
      return { ok: false, error: "Unable to complete password change." };
    }

    const hashed = await bcrypt.hash(parsed.data.newPassword, 12);

    await db.user.update({
      where: { id: userId },
      data: { passwordHash: hashed },
    });

    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to complete password change." };
  }
}
