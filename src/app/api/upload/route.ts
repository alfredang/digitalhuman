import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { saveBuffer, extForType } from "@/lib/storage";

export const dynamic = "force-dynamic";
// Allow reasonably large bodies (short videos / audio samples).
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await requireUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const prefix = (form?.get("prefix") as string) || "media";
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";
  const url = await saveBuffer(buf, {
    ext: extForType(contentType, "." + (file.name.split(".").pop() || "bin")),
    contentType,
    prefix,
  });
  return NextResponse.json({ url, contentType });
}
