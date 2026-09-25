import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/** AES-256-GCM sealing for cookies holding customer tokens. */
function key() {
  const secret =
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.SHOPIFY_APP_CLIENT_SECRET ||
    process.env.SHOPIFY_REVALIDATION_SECRET;
  if (!secret) throw new Error("CUSTOMER_SESSION_SECRET is not set");
  return createHash("sha256").update(secret).digest();
}

export function seal(data: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64url");
}

export function unseal<T>(value: string | undefined): T | undefined {
  if (!value) return undefined;
  try {
    const buf = Buffer.from(value, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
    decipher.setAuthTag(buf.subarray(12, 28));
    const dec = Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]);
    return JSON.parse(dec.toString("utf8")) as T;
  } catch {
    return undefined;
  }
}

export const randomString = (bytes = 32) => randomBytes(bytes).toString("base64url");

export const pkceChallenge = (verifier: string) => createHash("sha256").update(verifier).digest("base64url");
