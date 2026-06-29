import { prisma } from "@/lib/db";
import { embedTexts } from "@/lib/minimax/embeddings";

/** Split long text into ~1000-char chunks on paragraph/sentence boundaries. */
export function chunkText(text: string, maxChars = 1000): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (clean.length <= maxChars) return clean ? [clean] : [];
  const paras = clean.split(/\n{2,}/);
  const chunks: string[] = [];
  let buf = "";
  for (const p of paras) {
    if ((buf + "\n\n" + p).length > maxChars && buf) {
      chunks.push(buf.trim());
      buf = p;
    } else {
      buf = buf ? `${buf}\n\n${p}` : p;
    }
    while (buf.length > maxChars) {
      chunks.push(buf.slice(0, maxChars).trim());
      buf = buf.slice(maxChars);
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

/** Embed any of an avatar's knowledge docs that don't yet have a vector. Best-effort. */
export async function embedMissing(avatarId: string): Promise<number> {
  const docs = await prisma.knowledgeDoc.findMany({ where: { avatarId, embedding: null } });
  if (docs.length === 0) return 0;
  try {
    const vectors = await embedTexts(docs.map((d) => `${d.title}\n${d.content}`.slice(0, 4000)), "db");
    let n = 0;
    for (let i = 0; i < docs.length; i++) {
      if (vectors[i]) {
        await prisma.knowledgeDoc.update({ where: { id: docs[i].id }, data: { embedding: JSON.stringify(vectors[i]) } });
        n++;
      }
    }
    return n;
  } catch (e) {
    console.error("embedMissing failed (keyword fallback remains):", (e as Error).message);
    return 0;
  }
}

/** Ingest a script/document: chunk it, store chunks as knowledge, and embed them. */
export async function ingestScript(avatarId: string, title: string, text: string): Promise<{ chunks: number; embedded: number }> {
  const chunks = chunkText(text);
  if (chunks.length === 0) return { chunks: 0, embedded: 0 };
  await prisma.knowledgeDoc.createMany({
    data: chunks.map((content, i) => ({
      avatarId,
      title: chunks.length > 1 ? `${title} (${i + 1}/${chunks.length})` : title,
      content,
      chunkIndex: i,
    })),
  });
  const embedded = await embedMissing(avatarId);
  return { chunks: chunks.length, embedded };
}
