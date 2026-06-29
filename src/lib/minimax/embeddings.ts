import { getSetting } from "@/lib/settings";

// Built-in vector store: embeddings via MiniMax (embo-01). Vectors are stored
// JSON-encoded on KnowledgeDoc and compared with cosine similarity in-app.

function withGroup(url: string, groupId?: string) {
  const isChina = /minimaxi\.com/i.test(url);
  return isChina && groupId ? `${url}${url.includes("?") ? "&" : "?"}GroupId=${encodeURIComponent(groupId)}` : url;
}

export async function isEmbeddingConfigured(): Promise<boolean> {
  return Boolean(await getSetting("MINIMAX_API_KEY"));
}

/**
 * Embed an array of texts. `type` is "db" for stored documents, "query" for searches.
 * Returns one vector per input (or throws if not configured / API error).
 */
export async function embedTexts(texts: string[], type: "db" | "query" = "db"): Promise<number[][]> {
  if (texts.length === 0) return [];
  const apiKey = await getSetting("MINIMAX_API_KEY");
  if (!apiKey) throw new Error("MiniMax API key not configured for embeddings.");
  const groupId = await getSetting("MINIMAX_GROUP_ID");
  const baseUrl = ((await getSetting("MINIMAX_BASE_URL")) || "https://api.minimax.io/v1").replace(/\/$/, "");
  const model = (await getSetting("MINIMAX_EMBED_MODEL")) || "embo-01";

  const res = await fetch(withGroup(`${baseUrl}/embeddings`, groupId), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, texts, type }),
  });
  if (!res.ok) throw new Error(`MiniMax embeddings error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const vectors: number[][] | undefined = data?.vectors;
  if (!Array.isArray(vectors)) throw new Error(`MiniMax embeddings returned no vectors: ${JSON.stringify(data).slice(0, 200)}`);
  return vectors;
}

export async function embedOne(text: string, type: "db" | "query" = "query"): Promise<number[] | null> {
  try {
    const [v] = await embedTexts([text], type);
    return v ?? null;
  } catch {
    return null;
  }
}

export function cosineSim(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
