import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  persona: z.string().optional(),
  greeting: z.string().optional(),
  portraitUrl: z.string().optional(),
  voiceId: z.string().optional(),
  language: z.string().optional(),
  status: z.enum(["DRAFT", "READY"]).optional(),
  knowledge: z.array(z.object({ title: z.string(), content: z.string() })).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const avatar = await prisma.avatar.findUnique({ where: { id }, include: { knowledge: true } });
  if (!avatar) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(avatar);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { knowledge, ...data } = parsed.data;

  const avatar = await prisma.avatar.update({
    where: { id },
    data: {
      ...data,
      ...(knowledge
        ? {
            knowledge: {
              deleteMany: {},
              create: knowledge.map((k, i) => ({ title: k.title, content: k.content, chunkIndex: i })),
            },
          }
        : {}),
    },
    include: { knowledge: true },
  });
  return NextResponse.json(avatar);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await prisma.avatar.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
