import { getSetting } from "@/lib/settings";

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ToolDef = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type ChatResult = {
  content: string;
  toolCalls: ToolCall[];
};

// Resolve the active LLM provider config. Both MiniMax and Gemini expose an
// OpenAI-compatible /chat/completions endpoint, so one code path serves both.
async function llmConfig() {
  const provider = ((await getSetting("LLM_PROVIDER")) || "minimax").toLowerCase();

  if (provider === "gemini") {
    const apiKey = await getSetting("GEMINI_API_KEY");
    const baseUrl = (await getSetting("GEMINI_BASE_URL")) || "https://generativelanguage.googleapis.com/v1beta/openai";
    const model = (await getSetting("GEMINI_CHAT_MODEL")) || "gemini-2.0-flash";
    if (!apiKey) throw new Error("Gemini API key is not configured. Set it in /admin/settings.");
    return { provider, apiKey, baseUrl: baseUrl.replace(/\/$/, ""), model };
  }

  const apiKey = await getSetting("MINIMAX_API_KEY");
  const baseUrl = (await getSetting("MINIMAX_BASE_URL")) || "https://api.minimax.io/v1";
  const model = (await getSetting("MINIMAX_CHAT_MODEL")) || "MiniMax-M3";
  if (!apiKey) throw new Error("MiniMax API key is not configured. Set it in /admin/settings.");
  return { provider: "minimax", apiKey, baseUrl: baseUrl.replace(/\/$/, ""), model };
}

/**
 * Non-streaming chat completion (OpenAI-compatible). Used inside the agentic
 * tool-calling loop where we need the full message (incl. tool_calls) at once.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  opts: { tools?: ToolDef[]; temperature?: number } = {},
): Promise<ChatResult> {
  const { apiKey, baseUrl, model, provider } = await llmConfig();
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.7,
      ...(opts.tools && opts.tools.length ? { tools: opts.tools, tool_choice: "auto" } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${provider} chat error ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = await res.json();
  const msg = data?.choices?.[0]?.message ?? {};
  return {
    content: msg.content ?? "",
    toolCalls: (msg.tool_calls as ToolCall[]) ?? [],
  };
}

/** Simple one-shot text generation (used by the admin "test M3" tool). */
export async function quickAsk(system: string, user: string): Promise<string> {
  const { content } = await chatCompletion([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);
  return content;
}
