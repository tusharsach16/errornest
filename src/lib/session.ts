import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";

// next-auth/jwt getToken requires a req-like object; App Router exposes
// cookies directly, so we build the minimum shape it needs.
export async function getServerUserId(): Promise<string | null> {
  const token = await getToken({
    req: {
      cookies: Object.fromEntries(
        cookies()
          .getAll()
          .map(({ name, value }) => [name, value]),
      ),
    } as Parameters<typeof getToken>[0]["req"],
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? "",
  });
  return token?.sub ?? null;
}
