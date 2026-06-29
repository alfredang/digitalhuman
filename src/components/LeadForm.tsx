"use client";

import { useState } from "react";

type Fields = { name: string; email: string; company: string; phone: string; interest: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LeadForm() {
  const [f, setF] = useState<Fields>({ name: "", email: "", company: "", phone: "", interest: "" });
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  function set<K extends keyof Fields>(k: K, v: string) {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  // "Prehook": validate before submitting.
  function validate(): boolean {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (f.name.trim().length < 2) e.name = "Please enter your name";
    if (!EMAIL_RE.test(f.email)) e.email = "Please enter a valid email";
    if (!f.interest.trim()) e.interest = "Tell us what you'd like to see";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setState("sending");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, website }),
    });
    if (res.ok) setState("done");
    else {
      const d = await res.json().catch(() => ({}));
      setErrors({ email: d.error || "Something went wrong — please try again." });
      setState("idle");
    }
  }

  if (state === "done") {
    // "Posthook": acknowledgment.
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-100 text-3xl">✓</div>
        <h3 className="mt-4 text-xl font-bold text-slate-900">Thank you — request received!</h3>
        <p className="mt-2 text-slate-600">
          Our team will review your enquiry and <strong>get back to you within 3 business days</strong>. A confirmation
          has been sent to <span className="font-medium">{f.email}</span>.
        </p>
        <button
          onClick={() => {
            setF({ name: "", email: "", company: "", phone: "", interest: "" });
            setState("idle");
          }}
          className="mt-5 text-sm font-medium text-brand hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200 sm:p-8">
      <h3 className="text-xl font-bold text-slate-900">Request a free Digital Human demo</h3>
      <p className="mt-1 text-sm text-slate-500">
        See a lifelike AI educator answer questions about your courses. We&apos;ll reply within 3 business days.
      </p>

      {/* honeypot (hidden from humans) */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Name *" value={f.name} onChange={(v) => set("name", v)} error={errors.name} autoComplete="name" />
        <Field label="Work email *" type="email" value={f.email} onChange={(v) => set("email", v)} error={errors.email} autoComplete="email" />
        <Field label="Company / Organisation" value={f.company} onChange={(v) => set("company", v)} autoComplete="organization" />
        <Field label="Phone (optional)" value={f.phone} onChange={(v) => set("phone", v)} autoComplete="tel" />
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-slate-700">What would you like the avatar to demo? *</label>
        <textarea
          value={f.interest}
          onChange={(e) => set("interest", e.target.value)}
          rows={3}
          placeholder="e.g. A course advisor for our WSQ programmes, multilingual support, embedding on our site…"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        {errors.interest && <p className="mt-1 text-sm text-red-600">{errors.interest}</p>}
      </div>

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-5 w-full rounded-xl bg-brand py-3 font-semibold text-white shadow-sm hover:bg-brand-600 disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Request my demo →"}
      </button>
      <p className="mt-3 text-center text-xs text-slate-400">No spam. We only use your details to arrange the demo.</p>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/20 ${
          error ? "border-red-400" : "border-slate-300 focus:border-brand"
        }`}
      />
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}
