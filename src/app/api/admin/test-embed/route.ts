import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { embedTexts } from "@/lib/minimax/embeddings";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const provider = (await getSetting("EMBED_PROVIDER")) || "gemini";
  try {
    const vecs = await embedTexts(["hello world", "digital human course pricing"], "db");
    return NextResponse.json({ ok: true, provider, count: vecs.length, dims: vecs[0]?.length ?? 0 });
  } catch (e) {
    return NextResponse.json({ ok: false, provider, error: (e as Error).message }, { status: 502 });
  }
}
