"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const PHONE = "6596983731"; // wa.me number
const QUERIES = [
  "I'd like a free Digital Human demo",
  "How much does a digital human cost?",
  "Can you build an avatar for my industry?",
  "How do I embed it on my website?",
  "Can you clone our brand voice?",
];

function waLink(text: string) {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
}

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col items-start gap-3">
      {open && (
        <div className="w-[min(20rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
          <div className="flex items-center gap-2 bg-[#25D366] px-4 py-3 text-white">
            <MessageCircle className="h-5 w-5" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">Chat with us on WhatsApp</p>
              <p className="text-xs text-green-50">We typically reply within minutes</p>
            </div>
          </div>
          <div className="space-y-2 p-3">
            <p className="px-1 text-xs text-slate-500">Pick a question to start:</p>
            {QUERIES.map((q) => (
              <a
                key={q}
                href={waLink(q)}
                target="_blank"
                rel="noopener"
                className="block rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:border-[#25D366] hover:bg-green-50"
              >
                {q}
              </a>
            ))}
            <a
              href={waLink("Hi! I'm interested in your AI digital human service.")}
              target="_blank"
              rel="noopener"
              className="mt-1 block rounded-xl bg-[#25D366] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#1ebe5a]"
            >
              Open WhatsApp chat →
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close WhatsApp chat" : "Chat with us on WhatsApp"}
        aria-expanded={open}
        className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105 hover:bg-[#1ebe5a]"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </div>
  );
}
