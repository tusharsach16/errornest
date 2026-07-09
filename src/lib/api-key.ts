import { createHash, randomBytes } from "crypto";

/** Generates a new plaintext API key (shown once) + its hash (stored). */
export function generateApiKey(): { plaintext: string; hash: string } {
  const plaintext = `en_${randomBytes(24).toString("hex")}`;
  return { plaintext, hash: hashApiKey(plaintext) };
}

export function hashApiKey(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}
