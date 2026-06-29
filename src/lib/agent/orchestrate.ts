import type { Avatar } from "@prisma/client";
import { chatCompletion, type ChatMessage } from "@/lib/minimax/chat";
import { synthesize } from "@/lib/minimax/tts";
import { getRenderer } from "@/lib/avatar/renderer";
import { retrieveKnowledge } from "./knowledge";
import { TOOL_DEFS, runTool } from "./tools";

export type AgentEvent =
  | { type: "status"; stage: string }
  | { type: "tool"; name: string }
  | { type: "text"; text: string }
  | { type: "audio"; url: string }
  | { type: "video"; url: string }
  | { type: "done" }
  | { type: "error"; message: string };

const MAX_TOOL_ITERATIONS = 4;

/** Remove chain-of-thought (<think>…</think>) so it is never shown or spoken. */
function stripThinking(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "") // closed blocks
    .replace(/<think>[\s\S]*/gi, "") // unclosed (streamed) block
    .replace(/^[\s\S]*?<\/think>/i, "") // stray closing tag with preceding reasoning
    .trim();
}

/**
 * The agentic AI loop: ground → reason (with tool calls) → speak → render.
 * Yields events suitable for streaming to the client over SSE.
 */
export async function* orchestrate(opts: {
  avatar: Avatar;
  conversationId: string;
  history: { role: "user" | "assistant"; text: string }[];
  userText: string;
}): AsyncGenerator<AgentEvent> {
  const { avatar, conversationId, history, userText } = opts;

  try {
    yield { type: "status", stage: "thinking" };

    // 1) Ground on relevant knowledge up front.
    const grounding = await retrieveKnowledge(avatar.id, userText, 4);
    const groundingBlock = grounding.length
      ? `\n\nRelevant course knowledge (use it; do not invent facts beyond it):\n${grounding
          .map((g) => `- ${g.title}: ${g.content}`)
          .join("\n")}`
      : "";

    const language = avatar.language || "English";
    const systemPrompt =
      `${avatar.persona}\n\n` +
      `You are a spoken digital-human educator. Keep replies concise and conversational (2-4 sentences) since they will be spoken aloud. ` +
      `Always reply in ${language}. ` +
      `Use the lookup_course tool for specific course facts. Offer book_consultation when a learner shows strong interest.` +
      groundingBlock;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.text }) as ChatMessage),
      { role: "user", content: userText },
    ];

    // 2) Tool-calling loop.
    let finalText = "";
    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const result = await chatCompletion(messages, { tools: TOOL_DEFS });
      if (result.toolCalls.length === 0) {
        finalText = result.content;
        break;
      }
      // Record the assistant tool-call turn, then execute each tool.
      messages.push({ role: "assistant", content: result.content || null, tool_calls: result.toolCalls });
      for (const call of result.toolCalls) {
        yield { type: "tool", name: call.function.name };
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch {
          /* ignore malformed args */
        }
        const out = await runTool(call.function.name, args, { avatarId: avatar.id, conversationId });
        messages.push({ role: "tool", tool_call_id: call.id, name: call.function.name, content: out });
      }
      if (i === MAX_TOOL_ITERATIONS - 1) {
        // Final pass without tools to force an answer.
        const wrap = await chatCompletion(messages, {});
        finalText = wrap.content;
      }
    }

    finalText = stripThinking(finalText);
    if (!finalText) finalText = "Sorry, I didn't quite catch that. Could you rephrase?";
    yield { type: "text", text: finalText };

    // 3) Speak.
    yield { type: "status", stage: "speaking" };
    let audioUrl: string | null = null;
    try {
      audioUrl = await synthesize(finalText, { voiceId: avatar.voiceId ?? undefined, language });
      yield { type: "audio", url: audioUrl };
    } catch (e) {
      // Voice is best-effort; the UI can still show the text.
      yield { type: "status", stage: `tts-failed:${(e as Error).message.slice(0, 80)}` };
    }

    // 4) Render talking clip (best-effort enhancement).
    if (audioUrl && avatar.portraitUrl) {
      yield { type: "status", stage: "rendering" };
      const videoUrl = await getRenderer().renderTalkingClip({ portraitUrl: avatar.portraitUrl, audioUrl });
      if (videoUrl) yield { type: "video", url: videoUrl };
    }

    yield { type: "done" };
  } catch (e) {
    yield { type: "error", message: (e as Error).message };
  }
}
