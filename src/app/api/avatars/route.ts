import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1),
  sourceType: z.enum(["PHOTO", "VIDEO"]).default("PHOTO"),
  sourceMediaUrl: z.string().optional(),
  portraitUrl: z.string().optional(),
  voiceId: z.string().optional(),
  language: z.string().optional(),
  persona: z.string().optional(),
  greeting: z.string().optional(),
  knowledge: z.array(z.object({ title: z.string(), content: z.string() })).optional(),
});

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const avatars = await prisma.avatar.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(avatars);
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { knowledge, ...data } = parsed.data;
  const avatar = await prisma.avatar.create({
    data: {
      ...data,
      ownerId: admin.id,
      status: data.portraitUrl ? "READY" : "DRAFT",
      knowledge: knowledge?.length
        ? { create: knowledge.map((k, i) => ({ title: k.title, content: k.content, chunkIndex: i })) }
        : undefined,
    },
  });
  return NextResponse.json(avatar);
}
