// Extract plain text from an uploaded document for RAG ingestion.
// Supports PDF, DOCX, CSV, TXT, MD, JSON. Returns "" if it can't parse.

export async function extractText(buf: Buffer, filename: string, contentType?: string): Promise<string> {
  const name = filename.toLowerCase();
  const ct = (contentType || "").toLowerCase();

  if (name.endsWith(".pdf") || ct.includes("pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buf) });
    const result = await parser.getText();
    return result.text;
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
