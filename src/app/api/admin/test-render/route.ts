import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Diagnostic: call inference.sh /apps/run directly and return the raw response,
// so we can see the exact request/response shape to wire the renderer correctly.
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const token = await getSetting("INFERENCE_SH_TOKEN");
  const app = (await getSetting("AVATAR_RENDERER_APP")) || "bytedance/omnihuman-1-5";
  if (!token) return NextResponse.json({ error: "No inference.sh token set" }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as { image_url?: string; audio_url?: string; app?: string };
  const image_url = body.image_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600";
  const audio_url = body.audio_url || "https://www.tertiarytraining.com/embed.js"; // placeholder; pass a real audio_url

  try {
    const res = await fetch("https://api.inference.sh/apps/run", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ app: body.app || app, input: { image_url, audio_url } }),
    });
    const text = await res.text();
    return NextResponse.json({ status: res.status, app: body.app || app, body: text.slice(0, 1500) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
