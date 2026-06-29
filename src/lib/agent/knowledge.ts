import { prisma } from "@/lib/db";
import { embedOne, cosineSim } from "@/lib/minimax/embeddings";

const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "is", "are", "for", "in", "on", "what", "how", "do", "i", "you", "my"]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function keywordRank(docs: { title: string; content: string }[], query: string, topK: number) {
  const qTokens = new Set(tokenize(query));
  if (qTokens.size === 0) return docs.slice(0, topK);
  const scored = docs.map((d) => {
    const text = `${d.title} ${d.content}`.toLowerCase();
    let score = 0;
    for (const t of qTokens) if (text.includes(t)) score += 1;
    return { d, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0).slice(0, topK).map((s) => s.d);
}

/**
 * Retrieve the most relevant knowledge chunks for a query.
 * Uses the built-in vector store (cosine similarity over stored embeddings)
 * when embeddings exist; otherwise falls back to keyword matching.
 */
export async function retrieveKnowledge(avatarId: string, query: string, topK = 4): Promise<{ title: string; content: string }[]> {
  const docs = await prisma.knowledgeDoc.findMany({ where: { avatarId } });
  if (docs.length === 0) return [];

  const withVectors = docs.filter((d) => d.embedding);
  if (withVectors.length > 0) {
    const qVec = await embedOne(query, "query");
    if (qVec) {
      // 1) Semantic recall: rank all chunks by cosine, take a wider candidate set.
      const candidates = withVectors
        .map((d) => {
          let vec: number[] = [];
          try {
            vec = JSON.parse(d.embedding as string);
          } catch {
            /* ignore */
          }
          return { d, cos: vec.length ? cosineSim(qVec, vec) : -1 };
        })
        .filter((r) => r.cos > 0)
        .sort((a, b) => b.cos - a.cos)
        .slice(0, Math.max(topK * 3, 12));

      // 2) Rerank: blend semantic similarity with lexical overlap for precision.
      const qTokens = new Set(tokenize(query));
      const reranked = candidates
        .map(({ d, cos }) => {
          const text = `${d.title} ${d.content}`.toLowerCase();
          let hits = 0;
          for (const t of qTokens) if (text.includes(t)) hits++;
          const lex = qTokens.size ? hits / qTokens.size : 0;
          return { d, score: 0.75 * cos + 0.25 * lex };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map((r) => ({ title: r.d.title, content: r.d.content }));
      if (reranked.length) return reranked;
    }
  }

  // Fallback: keyword retrieval (and include any docs lacking embeddings).
  return keywordRank(docs.map((d) => ({ title: d.title, content: d.content })), query, topK);
}
