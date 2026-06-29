"use client";

import { useState } from "react";

type Page = { slug: string; title: string; content: string };

export default function PagesEditor({ pages }: { pages: Page[] }) {
  const [active, setActive] = useState(pages[0]?.slug ?? "");
  const [drafts, setDrafts] = useState<Record<string, Page>>(() => Object.fromEntries(pages.map((p) => [p.slug, p])));
  const [status, setStatus] = useState("");

  const page = drafts[active];
  if (!page) return <p className="mt-6 text-slate-500">No pages.</p>;

  function update(field: "title" | "content", value: string) {
    setDrafts((d) => ({ ...d, [active]: { ...d[active], [field]: value } }));
  }

  async function save() {
    setStatus("Saving…");
    const res = await fetch(`/api/pages/${active}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: page.title, content: page.content }),
    });
    setStatus(res.ok ? "Saved ✓" : "Failed to save");
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        {pages.map((p) => (
          <button
            key={p.slug}
            onClick={() => { setActive(p.slug); setStatus(""); }}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize ${active === p.slug ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {p.slug}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            value={page.title}
            onChange={(e) => update("title", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Content (HTML)</span>
          <textarea
            value={page.content}
            onChange={(e) => update("content", e.target.value)}
            rows={16}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
          />
        </label>
        <div className="flex items-center gap-3">
          <button onClick={save} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Save</button>
          <a href={`/${active}`} target="_blank" className="text-sm text-brand hover:underline">View page ↗</a>
          {status && <span className="text-sm text-slate-600">{status}</span>}
        </div>
      </div>
    </div>
  );
}
