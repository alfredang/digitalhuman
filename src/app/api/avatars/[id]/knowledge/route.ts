import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ingestScript } from "@/lib/agent/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const schema = z.object({
  title: z.string().min(1).max(300),
  text: z.string().min(1).max(200000),
});

// Upload a script/document → chunk into the built-in vector store (RAG).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const avatar = await prisma.avatar.findUnique({ where: { id }, select: { id: true } });
  if (!avatar) return NextResponse.json({ error: "Avatar not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const { chunks, embedded } = await ingestScript(id, parsed.data.title, parsed.data.text);
  return NextResponse.json({ ok: true, chunks, embedded });
}
