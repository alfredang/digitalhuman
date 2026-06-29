"use client";

import { useState } from "react";

type SettingInfo = { value: string; secret: boolean; isSet: boolean };
type Settings = Record<string, SettingInfo>;

const FIELDS: { key: string; label: string; hint?: string }[] = [
  { key: "MINIMAX_API_KEY", label: "MiniMax API Key", hint: "Used for M3 chat and Speech 2.8 TTS." },
  { key: "MINIMAX_GROUP_ID", label: "MiniMax Group ID", hint: "The numeric UID from your MiniMax profile (not your email). Needed for TTS." },
  { key: "MINIMAX_BASE_URL", label: "MiniMax Base URL" },
  { key: "MINIMAX_CHAT_MODEL", label: "MiniMax chat model", hint: "e.g. MiniMax-M3" },
  { key: "MINIMAX_TTS_MODEL", label: "TTS model", hint: "e.g. speech-2.8-turbo" },
  { key: "GEMINI_API_KEY", label: "Gemini API Key", hint: "Google AI Studio key — used for Gemini chat and/or embeddings." },
  { key: "GEMINI_CHAT_MODEL", label: "Gemini chat model", hint: "e.g. gemini-2.0-flash" },
  { key: "GEMINI_BASE_URL", label: "Gemini Base URL" },
  { key: "EMBED_PROVIDER", label: "Embedding provider (RAG)", hint: "gemini | minimax — powers the built-in vector store" },
  { key: "GEMINI_EMBED_MODEL", label: "Gemini embedding model", hint: "e.g. text-embedding-004" },
  { key: "INFERENCE_SH_TOKEN", label: "inference.sh Token", hint: "For avatar lip-sync rendering (optional)." },
  { key: "AVATAR_RENDERER_APP", label: "Avatar renderer app", hint: "e.g. bytedance/omnihuman-1-5" },
  { key: "LEAD_NOTIFY_EMAIL", label: "Lead notification email", hint: "Where demo enquiries are emailed." },
  { key: "SMTP_HOST", label: "SMTP Host", hint: "e.g. smtp.gmail.com — enables lead emails." },
  { key: "SMTP_PORT", label: "SMTP Port", hint: "587 (TLS) or 465 (SSL)" },
  { key: "SMTP_USER", label: "SMTP User" },
  { key: "SMTP_PASS", label: "SMTP Password / App Password" },
  { key: "SMTP_FROM", label: "SMTP From address", hint: "Defaults to SMTP User." },
];

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of FIELDS) v[f.key] = initial[f.key]?.secret ? "" : initial[f.key]?.value ?? "";
    v.LLM_PROVIDER = initial.LLM_PROVIDER?.value || "minimax";
    v.DEMO_ENABLED = initial.DEMO_ENABLED?.value || "false";
    return v;
  });
  const [status, setStatus] = useState("");
  const [testResult, setTestResult] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setStatus("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    setStatus(res.ok ? "Saved ✓" : "Failed to save");
  }

  async function testChat() {
    setTestResult("Testing…");
    const res = await fetch("/api/admin/test-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Say hello in one short sentence and name which AI model you are." }),
    });
    const data = await res.json();
    setTestResult(data.ok ? `✓ ${data.reply}` : `✗ ${data.error}`);
  }

  const provider = values.LLM_PROVIDER || "minimax";
  const demoEnabled = values.DEMO_ENABLED === "true";

  return (
    <div className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      {/* Public landing-page demo toggle */}
      <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div>
          <span className="text-sm font-medium text-slate-700">Live avatar demo on landing page</span>
          <span className="mt-1 block text-xs text-slate-500">
            When off, the public homepage hides the interactive avatar and shows a “Book a demo” CTA instead —
            so visitors can&apos;t spam the chat and consume API tokens. Turn on only when you want a live demo public.
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={demoEnabled}
          onClick={() => setValues((v) => ({ ...v, DEMO_ENABLED: demoEnabled ? "false" : "true" }))}
          className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
            demoEnabled ? "bg-brand" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
              demoEnabled ? "translate-x-[22px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* LLM provider selector */}
      <label className="block">
        <span className="text-sm font-medium text-slate-700">AI provider (dialogue)</span>
        <select
          value={provider}
          onChange={(e) => setValues((v) => ({ ...v, LLM_PROVIDER: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          <option value="minimax">MiniMax (M3)</option>
          <option value="gemini">Google Gemini</option>
        </select>
        <span className="mt-1 block text-xs text-slate-400">
          Choose which LLM answers learners. Voice (TTS) uses MiniMax Speech 2.8 when configured, otherwise the browser voice.
        </span>
      </label>

      {FIELDS.map((f) => {
        const info = initial[f.key];
        const isSecret = info?.secret;
        return (
          <label key={f.key} className="block">
            <span className="text-sm font-medium text-slate-700">{f.label}</span>
            {isSecret && info?.isSet && (
              <span className="ml-2 text-xs text-green-600">● currently set</span>
            )}
            <input
              type={isSecret ? "password" : "text"}
              value={values[f.key] ?? ""}
              placeholder={isSecret && info?.isSet ? "•••••••• (unchanged)" : ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            {f.hint && <span className="mt-1 block text-xs text-slate-400">{f.hint}</span>}
          </label>
        );
      })}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
        <button
          onClick={testChat}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
        >
          Test AI connection
        </button>
        {status && <span className="text-sm text-slate-600">{status}</span>}
      </div>
      {testResult && (
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{testResult}</p>
      )}
    </div>
  );
}
