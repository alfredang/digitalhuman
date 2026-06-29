import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Stores media (uploaded photos/videos, voice samples, generated clips).
// Uses S3-compatible storage when configured, else falls back to ./public/uploads.

const useS3 = Boolean(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID);

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");

let s3: S3Client | null = null;
function getS3() {
  if (!s3) {
    s3 = new S3Client({
      region: process.env.S3_REGION || "us-east-1",
      ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true } : {}),
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3;
}

function randomName(ext: string) {
  return `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
}

/** Save a buffer and return a publicly reachable URL. */
export async function saveBuffer(buf: Buffer, opts: { ext: string; contentType: string; prefix?: string }): Promise<string> {
  const key = `${opts.prefix ? opts.prefix + "/" : ""}${randomName(opts.ext)}`;

  if (useS3) {
    await getS3().send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: buf,
        ContentType: opts.contentType,
        ACL: "public-read",
      }),
    );
    const base = process.env.S3_PUBLIC_URL || `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}`;
    return `${base.replace(/\/$/, "")}/${key}`;
  }

  // Local fallback
  const full = path.join(LOCAL_DIR, key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, buf);
  return `/uploads/${key}`;
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/webm": ".webm",
  "audio/wav": ".wav",
};

export function extForType(contentType: string, fallback = ".bin") {
  return EXT_BY_TYPE[contentType] || fallback;
}

/** Resolve a stored URL (possibly relative) to an absolute URL the external APIs can fetch. */
export function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  const base = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${url}`;
}
