"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Post = {
  slug: string; title: string; excerpt: string; content: string;
  industry: string; coverImage: string; published: boolean;
};

const EMPTY: Post = { slug: "", title: "", excerpt: "", content: "<p></p>", industry: "", coverImage: "", published: true };

export default function BlogManager({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Post | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [status, setStatus] = useState("");

  function edit(p: Post) { setEditing({ ...p }); setIsNew(false); setStatus(""); }
  function create() { setEditing({ ...EMPTY }); setIsNew(true); setStatus(""); }

  async function save() {
    if (!editing) return;
    setStatus("Saving…");
    const res = isNew
      ? await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) })
      : await fetch(`/api/posts/${editing.slug}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    if (res.ok) { setEditing(null); router.refresh(); }
    else setStatus((await res.json().catch(() => ({}))).error || "Failed");
  }

  async function remove(slug: string) {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${slug}`, { method: "DELETE" });
    router.refresh();
  }

  if (editing) {
    const f = editing;
    const set = (k: keyof Post, v: string | boolean) => setEditing({ ...f, [k]: v });
    return (
      <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug (url)" value={f.slug} disabled={!isNew} onChange={(v) => set("slug", v)} placeholder="my-post" />
          <Field label="Industry" value={f.industry} onChange={(v) => set("industry", v)} placeholder="Education" />
        </div>
        <Field label="Title" value={f.title} onChange={(v) => set("title", v)} />
        <Field label="Excerpt" value={f.excerpt} onChange={(v) => set("excerpt", v)} />
        <Field label="Cover image URL" value={f.coverImage} onChange={(v) => set("coverImage", v)} />
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Content (HTML)</span>
          <textarea value={f.content} onChange={(e) => set("content", e.target.value)} rows={14} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} /> Published
        </label>
        <div className="flex items-center gap-3">
          <button onClick={save} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Save</button>
          <button onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
          {status && <span className="text-sm text-red-600">{status}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button onClick={create} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">+ New post</button>
      <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {posts.map((p) => (
          <div key={p.slug} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">{p.title}</p>
              <p className="text-xs text-slate-500">/{p.slug} · {p.industry || "—"} · {p.published ? "published" : "draft"}</p>
            </div>
            <div className="flex shrink-0 gap-2 text-sm">
              <a href={`/blog/${p.slug}`} target="_blank" className="text-slate-500 hover:text-brand">View</a>
              <button onClick={() => edit(p)} className="text-brand hover:underline">Edit</button>
              <button onClick={() => remove(p.slug)} className="text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, disabled, placeholder }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input value={value} disabled={disabled} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100" />
    </label>
  );
}
