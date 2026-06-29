"use client";

import { useState } from "react";
import { X } from "lucide-react";

// Official WhatsApp glyph
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.04 4C9.93 4 4.97 8.96 4.97 15.07c0 1.95.51 3.86 1.48 5.54L4 28l7.6-2.42a11.04 11.04 0 0 0 4.44.93h.01c6.11 0 11.07-4.96 11.07-11.07 0-2.96-1.15-5.74-3.24-7.83A11 11 0 0 0 16.04 4zm0 20.2h-.01c-1.4 0-2.78-.38-3.98-1.09l-.29-.17-4.51 1.44 1.46-4.4-.19-.3a9.18 9.18 0 0 1-1.41-4.91c0-5.08 4.13-9.21 9.22-9.21 2.46 0 4.78.96 6.52 2.7a9.16 9.16 0 0 1 2.7 6.52c0 5.09-4.13 9.22-9.22 9.22zm5.05-6.9c-.28-.14-1.64-.81-1.89-.9-.25-.09-.43-.14-.62.14-.18.28-.71.9-.87 1.08-.16.18-.32.21-.6.07-.28-.14-1.17-.43-2.23-1.38-.82-.74-1.38-1.65-1.54-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.49.14-.16.18-.28.28-.46.09-.18.05-.35-.02-.49-.07-.14-.62-1.5-.85-2.05-.22-.54-.45-.46-.62-.47-.16-.01-.35-.01-.53-.01-.18 0-.49.07-.74.35-.25.28-.97.95-.97 2.31 0 1.36.99 2.68 1.13 2.86.14.18 1.95 2.98 4.73 4.18.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z" />
    </svg>
  );
}

const PHONE = "6588666375"; // wa.me number
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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[min(20rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
          <div className="flex items-center gap-2 bg-[#128C7E] px-4 py-3 text-white">
            <WhatsAppIcon className="h-5 w-5" />
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
                className="block rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:border-[#128C7E] hover:bg-green-50"
              >
                {q}
              </a>
            ))}
            <a
              href={waLink("Hi! I'm interested in your AI digital human service.")}
              target="_blank"
              rel="noopener"
              className="mt-1 block rounded-xl bg-[#128C7E] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#0b6b5f]"
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
        className="grid h-14 w-14 place-items-center rounded-full bg-[#128C7E] text-white shadow-xl transition hover:scale-105 hover:bg-[#0b6b5f]"
      >
        {open ? <X className="h-6 w-6" /> : <WhatsAppIcon className="h-7 w-7" />}
      </button>
    </div>
  );
}
