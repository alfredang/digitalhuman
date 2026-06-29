import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { quickAsk } from "@/lib/minimax/chat";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { prompt } = (await req.json().catch(() => ({}))) as { prompt?: string };
  try {
    const reply = await quickAsk(
      "You are a helpful assistant verifying API connectivity. Answer in one short sentence.",
      prompt || "Say hello and confirm you are MiniMax M3.",
    );
    return NextResponse.json({ ok: true, reply });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
