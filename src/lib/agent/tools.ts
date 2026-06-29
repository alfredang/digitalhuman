import type { ToolDef } from "@/lib/minimax/chat";
import { prisma } from "@/lib/db";
import { retrieveKnowledge } from "./knowledge";

// Tools exposed to MiniMax M3 during the agentic loop.
export const TOOL_DEFS: ToolDef[] = [
  {
    type: "function",
    function: {
      name: "lookup_course",
      description:
        "Search the training provider's course knowledge base for details (content, fees, schedule, prerequisites). Use this whenever the learner asks about specific courses or programmes.",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "What to look up, e.g. 'Python WSQ fees'" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "book_consultation",
      description: "Record a learner's request for a callback / consultation with a human course advisor.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          topic: { type: "string", description: "What they want to discuss" },
        },
        required: ["name", "topic"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "escalate_to_human",
      description: "Flag that the question needs a human advisor (complex, complaint, or out of scope).",
      parameters: {
        type: "object",
        properties: { reason: { type: "string" } },
        required: ["reason"],
      },
    },
  },
];

export async function runTool(
  name: string,
  args: Record<string, unknown>,
  ctx: { avatarId: string; conversationId: string },
): Promise<string> {
  switch (name) {
    case "lookup_course": {
      const results = await retrieveKnowledge(ctx.avatarId, String(args.query || ""), 4);
      if (results.length === 0) return "No matching course information found in the knowledge base.";
      return results.map((r) => `## ${r.title}\n${r.content}`).join("\n\n");
    }
    case "book_consultation": {
      await prisma.message.create({
        data: {
          conversationId: ctx.conversationId,
          role: "SYSTEM",
          text: `[LEAD] Consultation requested — name=${args.name ?? "?"}, email=${args.email ?? "?"}, topic=${args.topic ?? "?"}`,
        },
      });
      return `Consultation request recorded for ${args.name ?? "the learner"}. A course advisor will follow up${
        args.email ? ` at ${args.email}` : ""
      }.`;
    }
    case "escalate_to_human": {
      await prisma.message.create({
        data: { conversationId: ctx.conversationId, role: "SYSTEM", text: `[ESCALATION] ${args.reason ?? ""}` },
      });
      return "Acknowledged — a human course advisor will be brought in to help.";
    }
    default:
      return `Unknown tool: ${name}`;
  }
}
