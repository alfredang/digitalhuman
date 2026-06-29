"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VOICES, LANGUAGES, DEFAULT_VOICE_ID } from "@/lib/minimax/voices";

export default function AvatarActions({
  id,
  embedKey,
  voiceId: initialVoiceId,
  language: initialLanguage,
}: {
  id: string;
  embedKey: string;
  hasVoice: boolean;
  voiceId: string;
  language: string;
}) {
  const router = useRouter();
  const [voiceId, setVoiceId] = useState(initialVoiceId || DEFAULT_VOICE_ID);
  const [language, setLanguage] = useState(initialLanguage || "English");
  const [savedVoice, setSavedVoice] = useState("");
  const [previewText, setPreviewText] = useState("Hello! Welcome to Tertiary Infotech. How can I help you today?");
  const [audioUrl, setAudioUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [scriptTitle, setScriptTitle] = useState("");
  const [scriptText, setScriptText] = useState("");
  const [ingestMsg, setIngestMsg] = useState("");

  async function onScriptFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!scriptTitle) setScriptTitle(file.name.replace(/\.[^.]+$/, ""));
    setScriptText(await file.text());
  }

  async function ingestScript() {
    if (!scriptText.trim()) return setIngestMsg("Paste or upload a script first.");
    setIngestMsg("Ingesting & embedding…");
    const res = await fetch(`/api/avatars/${id}/knowledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: scriptTitle || "Script", text: scriptText }),
    });
    const d = await res.json();
    if (d.ok) {
      setIngestMsg(`✓ Added ${d.chunks} chunk(s), ${d.embedded} embedded into the vector store.`);
      setScriptText(""); setScriptTitle("");
      router.refresh();
    } else setIngestMsg(`✗ ${d.error || "Failed"}`);
  }

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

  async function saveVoice() {
    setSavedVoice("Saving…");
    const res = await fetch(`/api/avatars/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voiceId, language }),
    });
    setSavedVoice(res.ok ? "Saved ✓" : "Failed");
    router.refresh();
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
        <label className="text-sm font-medium text-slate-700">Voice &amp; language</label>
        <div className="mt-1 flex flex-wrap gap-2">
          <select
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
          >
            <optgroup label="Female">
              {VOICES.filter((v) => v.gender === "female").map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </optgroup>
            <optgroup label="Male">
              {VOICES.filter((v) => v.gender === "male").map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </optgroup>
          </select>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button onClick={saveVoice} className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-600">
            Save
          </button>
          {savedVoice && <span className="self-center text-sm text-slate-600">{savedVoice}</span>}
        </div>
        <p className="mt-1 text-xs text-amber-600">
          Note: if a custom cloned voice exists it overrides this preset.
        </p>
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
        <label className="text-sm font-medium text-slate-700">Train on a script / document (RAG)</label>
        <p className="text-xs text-slate-500">Upload or paste text — it&apos;s chunked and embedded into the built-in vector store.</p>
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={scriptTitle}
              onChange={(e) => setScriptTitle(e.target.value)}
              placeholder="Title (e.g. Course catalogue)"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input type="file" accept=".txt,.md,.csv,text/*" onChange={onScriptFile} className="text-sm" />
          </div>
          <textarea
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            rows={4}
            placeholder="Paste a script, FAQ, product or course content…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-3">
            <button onClick={ingestScript} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
              Ingest into vector store
            </button>
            {ingestMsg && <span className="text-sm text-slate-600">{ingestMsg}</span>}
          </div>
        </div>
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
