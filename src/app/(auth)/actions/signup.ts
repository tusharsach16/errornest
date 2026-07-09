"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { signupSchema } from "@/lib/validators/auth.validators";

export type SignupState = {
  fieldErrors?: Partial<Record<"name" | "email" | "password", string>>;
  formError?: string;
};

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: SignupState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof NonNullable<SignupState["fieldErrors"]>;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: "An account with this email already exists." } };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.create({ data: { name, email, passwordHash } });

  // User is created; redirect to login so they sign in via the credentials
  // flow. Signing in server-side from a server action requires the full
  // next-auth server import, which is only available in next-auth v5+.
  // At v4 the safe path is: create account → redirect to /login?created=1.
  redirect("/login?created=1");
}
