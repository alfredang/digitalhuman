import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractText, isSupportedDoc } from "@/lib/extract";
import { ingestScript } from "@/lib/agent/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

// Upload a document (PDF/DOCX/CSV/TXT) → extract → chunk → embed → vector store.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const avatar = await prisma.avatar.findUnique({ where: { id }, select: { id: true } });
  if (!avatar) return NextResponse.json({ error: "Avatar not found" }, { status: 404 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 413 });
  if (!isSupportedDoc(file.name, file.type)) {
    return NextResponse.json({ error: "Unsupported file type (use PDF, DOCX, CSV, TXT, MD)" }, { status: 415 });
  }

  let text = "";
  try {
    text = await extractText(Buffer.from(await file.arrayBuffer()), file.name, file.type);
  } catch (e) {
    return NextResponse.json({ error: `Could not read file: ${(e as Error).message.slice(0, 120)}` }, { status: 422 });
  }
  if (!text.trim()) return NextResponse.json({ error: "No extractable text found in file" }, { status: 422 });

  const title = (form?.get("title") as string) || file.name.replace(/\.[^.]+$/, "");
  const { chunks, embedded } = await ingestScript(id, title, text);
  return NextResponse.json({ ok: true, file: file.name, chars: text.length, chunks, embedded });
}
