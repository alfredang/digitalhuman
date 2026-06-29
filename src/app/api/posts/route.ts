import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, "lowercase, digits and hyphens only"),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500),
  content: z.string().max(100000),
  industry: z.string().max(60).optional().or(z.literal("")),
  coverImage: z.string().max(2000).optional().or(z.literal("")),
  published: z.boolean().optional(),
});

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const { industry, coverImage, ...rest } = parsed.data;
  try {
    const post = await prisma.post.create({
      data: { ...rest, industry: industry || null, coverImage: coverImage || null },
    });
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }
}
