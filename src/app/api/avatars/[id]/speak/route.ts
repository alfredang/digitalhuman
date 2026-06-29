import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { synthesize } from "@/lib/minimax/tts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({ text: z.string().min(1).max(5000) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "text required" }, { status: 400 });

  const avatar = await prisma.avatar.findUnique({ where: { id } });
  if (!avatar) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const audioUrl = await synthesize(parsed.data.text, {
      voiceId: avatar.voiceId ?? undefined,
      language: avatar.language,
    });
    return NextResponse.json({ ok: true, audioUrl });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
