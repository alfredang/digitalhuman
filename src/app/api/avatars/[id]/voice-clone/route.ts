import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cloneVoice } from "@/lib/minimax/tts";
import { toAbsoluteUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const schema = z.object({ sampleUrl: z.string().max(2000) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "sampleUrl required" }, { status: 400 });

  try {
    const voiceId = await cloneVoice(toAbsoluteUrl(parsed.data.sampleUrl));
    const avatar = await prisma.avatar.update({ where: { id }, data: { voiceId } });
    return NextResponse.json({ ok: true, voiceId: avatar.voiceId });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
