// Extract plain text from an uploaded document for RAG ingestion.
// Supports PDF, DOCX, CSV, TXT, MD, JSON. Returns "" if it can't parse.

export async function extractText(buf: Buffer, filename: string, contentType?: string): Promise<string> {
  const name = filename.toLowerCase();
  const ct = (contentType || "").toLowerCase();

  if (name.endsWith(".pdf") || ct.includes("pdf")) {
    // Import the lib entry (not index.js) to skip pdf-parse's debug-mode test-file read;
    // v1 bundles pdf.js and needs no external worker (works in standalone/serverless).
    // @ts-expect-error - no type declarations for the subpath
    const mod = await import("pdf-parse/lib/pdf-parse.js");
    const pdf = (mod.default ?? mod) as (b: Buffer) => Promise<{ text: string }>;
    const { text } = await pdf(buf);
    return text;
  }

  if (name.endsWith(".docx") || ct.includes("officedocument.wordprocessingml")) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return value;
  }

  // CSV / TXT / MD / JSON / anything text-like
  return buf.toString("utf8");
}

export function isSupportedDoc(filename: string, contentType?: string): boolean {
  const n = filename.toLowerCase();
  if (/\.(pdf|docx|csv|txt|md|markdown|json|tsv)$/.test(n)) return true;
  const ct = (contentType || "").toLowerCase();
  return /pdf|wordprocessingml|text\/|csv|json/.test(ct);
}
