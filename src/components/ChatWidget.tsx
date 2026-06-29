"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

export default function ChatWidget({
  avatarId,
  name,
  greeting,
  portraitUrl,
  compact = false,
}: {
  avatarId: string;
  name: string;
  greeting: string;
  portraitUrl?: string;
  compact?: boolean;
}) {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: greeting }]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [listening, setListening] = useState(false);

  const conversationId = useRef<string | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);
    setVideoUrl("");
    setMessages((m) => [...m, { role: "user", text: q }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarId, text: q, conversationId: conversationId.current }),
    });
    if (!res.body) {
      setBusy(false);
      setStatus("");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantText = "";
    let pendingAudio = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";
      for (const part of parts) {
        const line = part.replace(/^data: /, "").trim();
        if (!line) continue;
        let ev: Record<string, string>;
        try {
          ev = JSON.parse(line);
        } catch {
          continue;
        }
        switch (ev.type) {
          case "conversation":
            conversationId.current = ev.id;
            break;
          case "status":
            setStatus(statusLabel(ev.stage));
            break;
          case "tool":
            setStatus(`using ${ev.name.replace(/_/g, " ")}…`);
            break;
          case "text":
            assistantText = ev.text;
            setMessages((m) => [...m, { role: "assistant", text: ev.text }]);
            break;
          case "audio":
            pendingAudio = ev.url;
            // Play audio immediately; the video (if any) will replace the still.
            if (audioRef.current) {
              audioRef.current.src = ev.url;
              audioRef.current.play().catch(() => {});
            }
            break;
          case "video":
            setVideoUrl(ev.url);
            break;
          case "error":
            setMessages((m) => [...m, { role: "assistant", text: `⚠️ ${ev.message}` }]);
            break;
        }
      }
    }
    void assistantText;
    void pendingAudio;
    setStatus("");
    setBusy(false);
  }

  // When a lip-sync video arrives, play it (muted audio element to avoid double sound).
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      if (audioRef.current) audioRef.current.pause();
      videoRef.current.src = videoUrl;
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl]);

  function toggleMic() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setStatus("Voice input not supported in this browser — type instead.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => {
      const transcript = e.results[0][0].transcript;
      send(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl bg-white ${compact ? "h-[600px]" : "h-[80vh] max-h-[760px]"} shadow-xl ring-1 ring-slate-200`}>
      {/* Stage */}
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-700">
        <div className="mx-auto aspect-square w-44">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            playsInline
            className={`h-full w-full rounded-b-2xl object-cover ${videoUrl ? "block" : "hidden"}`}
            onEnded={() => setVideoUrl("")}
          />
          {!videoUrl &&
            (portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={portraitUrl} alt={name} className={`h-full w-full object-cover ${busy ? "animate-float" : ""}`} />
            ) : (
              <div className="grid h-full place-items-center text-4xl text-white">🧑‍🏫</div>
            ))}
        </div>
        <div className="pb-3 text-center">
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="h-4 text-xs text-indigo-200">{status}</p>
        </div>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio ref={audioRef} className="hidden" />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.role === "user" ? "bg-brand text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
        <button
          onClick={toggleMic}
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
            listening ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
          title="Speak"
        >
          🎙
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder={listening ? "Listening…" : "Ask about our courses…"}
          className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          onClick={() => send(input)}
          disabled={busy}
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function statusLabel(stage: string): string {
  if (stage === "thinking") return "thinking…";
  if (stage === "speaking") return "generating voice…";
  if (stage === "rendering") return "animating…";
  if (stage.startsWith("tts-failed")) return "voice unavailable";
  return "";
}
