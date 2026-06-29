import { prisma } from "@/lib/db";

const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "is", "are", "for", "in", "on", "what", "how", "do", "i", "you", "my"]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

/** Lightweight keyword retrieval over an avatar's knowledge docs. */
export async function retrieveKnowledge(avatarId: string, query: string, topK = 4): Promise<{ title: string; content: string }[]> {
  const docs = await prisma.knowledgeDoc.findMany({ where: { avatarId } });
  if (docs.length === 0) return [];
  const qTokens = new Set(tokenize(query));
  if (qTokens.size === 0) return docs.slice(0, topK).map((d) => ({ title: d.title, content: d.content }));

  const scored = docs.map((d) => {
    const text = `${d.title} ${d.content}`.toLowerCase();
    let score = 0;
    for (const t of qTokens) if (text.includes(t)) score += 1;
    return { d, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored
    .filter((s) => s.score > 0)
    .slice(0, topK)
    .map((s) => ({ title: s.d.title, content: s.d.content }));
}
