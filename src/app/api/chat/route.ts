import { z } from "zod";
import { prisma } from "@/lib/db";
import { orchestrate, type AgentEvent } from "@/lib/agent/orchestrate";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const schema = z.object({
  avatarId: z.string(),
  text: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
});

function sse(event: AgentEvent | { type: "conversation"; id: string }) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
  }
  const { avatarId, text } = parsed.data;

  const avatar = await prisma.avatar.findUnique({ where: { id: avatarId } });
  if (!avatar) return new Response(JSON.stringify({ error: "Avatar not found" }), { status: 404 });

  // Find or create conversation.
  let conversationId = parsed.data.conversationId;
  if (conversationId) {
    const exists = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!exists || exists.avatarId !== avatarId) conversationId = undefined;
  }
  if (!conversationId) {
    const conv = await prisma.conversation.create({ data: { avatarId } });
    conversationId = conv.id;
  }

  // Load short history (last 10 messages) for context.
  const prior = await prisma.message.findMany({
    where: { conversationId, role: { in: ["USER", "ASSISTANT"] } },
    orderBy: { createdAt: "asc" },
    take: 20,
  });
  const history = prior.map((m) => ({ role: m.role === "USER" ? ("user" as const) : ("assistant" as const), text: m.text }));

  await prisma.message.create({ data: { conversationId, role: "USER", text } });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(sse({ type: "conversation", id: conversationId! })));

      let finalText = "";
      let audioUrl: string | undefined;
      let videoUrl: string | undefined;
      try {
        for await (const ev of orchestrate({ avatar, conversationId: conversationId!, history, userText: text })) {
          if (ev.type === "text") finalText = ev.text;
          if (ev.type === "audio") audioUrl = ev.url;
          if (ev.type === "video") videoUrl = ev.url;
          controller.enqueue(encoder.encode(sse(ev)));
        }
      } catch (e) {
        controller.enqueue(encoder.encode(sse({ type: "error", message: (e as Error).message })));
      }

      // Persist the assistant turn.
      if (finalText) {
        await prisma.message.create({
          data: { conversationId: conversationId!, role: "ASSISTANT", text: finalText, audioUrl, videoUrl },
        });
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
