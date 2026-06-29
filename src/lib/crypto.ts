import crypto from "crypto";

// AES-256-GCM encryption for secrets stored in the DB (Setting.valueEncrypted).
// ENCRYPTION_KEY must be 32 bytes (base64 or hex or raw utf8 of length 32).

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("ENCRYPTION_KEY is not set");
  // Try base64, then hex, then utf8 — pick whatever yields 32 bytes.
  for (const enc of ["base64", "hex"] as const) {
    try {
      const b = Buffer.from(raw, enc);
      if (b.length === 32) return b;
    } catch {
      /* ignore */
    }
  }
  const utf = Buffer.from(raw, "utf8");
  if (utf.length === 32) return utf;
  // Fall back to a SHA-256 digest so any-length key still works.
  return crypto.createHash("sha256").update(raw).digest();
}

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(":");
}

export function decrypt(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(":");
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
}
