import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Serve runtime-uploaded media (TTS audio, avatar portraits, voice samples).
// Next.js does NOT serve files written to public/ after build, so we stream
// them from disk here. (Use S3 storage in production for persistence.)
const ROOT = path.join(process.cwd(), "public", "uploads");

const TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".webm": "audio/webm",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const rel = (parts || []).join("/");
  const full = path.join(ROOT, rel);
  if (!full.startsWith(ROOT + path.sep)) return new NextResponse("Bad path", { status: 400 });
  try {
    const buf = await fs.readFile(full);
    const ext = path.extname(full).toLowerCase();
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": TYPES[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
