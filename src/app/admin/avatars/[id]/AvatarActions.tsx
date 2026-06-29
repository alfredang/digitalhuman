"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AvatarActions({ id, embedKey }: { id: string; embedKey: string; hasVoice: boolean }) {
  const router = useRouter();
  const [previewText, setPreviewText] = useState("Hello! Welcome to Tertiary Infotech. How can I help you today?");
  const [audioUrl, setAudioUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const embedSnippet = `<script src="${origin}/embed.js" data-avatar="${embedKey}" async></script>`;

  async function preview() {
    setBusy(true);
    setMsg("");
    setAudioUrl("");
    const res = await fetch(`/api/avatars/${id}/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: previewText }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.ok) setAudioUrl(data.audioUrl);
    else setMsg(`✗ ${data.error}`);
  }

  async function remove() {
    if (!confirm("Delete this avatar?")) return;
    await fetch(`/api/avatars/${id}`, { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap gap-3">
        <a
          href={`/chat/${id}`}
          target="_blank"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Open chat ↗
        </a>
        <button onClick={remove} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
          Delete
        </button>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Test the voice (MiniMax Speech 2.8)</label>
        <div className="mt-1 flex gap-2">
          <input
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            onClick={preview}
            disabled={busy}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
          >
            {busy ? "…" : "▶ Speak"}
          </button>
        </div>
        {msg && <p className="mt-1 text-sm text-red-600">{msg}</p>}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        {audioUrl && <audio src={audioUrl} controls autoPlay className="mt-2 w-full" />}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Embed on any website</label>
        <textarea
          readOnly
          value={embedSnippet}
          rows={2}
          onFocus={(e) => e.currentTarget.select()}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs"
        />
      </div>
    </div>
  );
}
