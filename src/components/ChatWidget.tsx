"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

// Quick-tap prompts to test the avatar's voice + answers fast.
const SUGGESTIONS = [
  "What courses do you offer?",
  "How much is the Python course?",
  "Tell me about your AI training",
  "Do you have weekend classes?",
  "I'd like to book a consultation",
];

export default function ChatWidget({
  avatarId,
  name,
  greeting,
  portraitUrl,
  compact = false,
  demoOff = false,
}: {
  avatarId: string;
  name: string;
  greeting: string;
  portraitUrl?: string;
  compact?: boolean;
  // When true, the avatar is shown but the chat is disabled — sending text or
  // using voice replies with a "demo currently off" notice (no API calls).
  demoOff?: boolean;
}) {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: greeting }]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [listening, setListening] = useState(false);
  const [talking, setTalking] = useState(false);
  const [mode, setMode] = useState<"text" | "voice">("text");

  const conversationId = useRef<string | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  // Browser speech-synthesis fallback so the avatar ALWAYS talks, even if
  // server-side TTS (MiniMax) isn't configured yet.
  function speakBrowser(text: string) {
    try {
      const synth = window.speechSynthesis;
      if (!synth || !text) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[*_#`>]/g, ""));
      u.rate = 1.02;
      u.pitch = 1.05;
      // Prefer a female voice so it matches a female presenter.
      const voices = synth.getVoices();
      const female = voices.find((v) =>
        /female|samantha|karen|victoria|tessa|fiona|moira|zira|google uk english female|google us english/i.test(
          `${v.name} ${(v as SpeechSynthesisVoice & { gender?: string }).gender ?? ""}`,
        ),
      );
      if (female) u.voice = female;
      u.onstart = () => setTalking(true);
      u.onend = () => setTalking(false);
      synth.speak(u);
    } catch {
      /* ignore */
    }
  }

  const DEMO_OFF_MSG = "⚠️ The live demo is currently turned off. Please book a free demo and we'll show you a personalised digital human.";

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    if (demoOff) {
      setInput("");
      setMessages((m) => [...m, { role: "user", text: q }, { role: "assistant", text: DEMO_OFF_MSG }]);
      return;
    }
    setInput("");
    setBusy(true);
    setVideoUrl("");
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    setMessages((m) => [...m, { role: "user", text: q }]);

    let res: Response;
    try {
      res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarId, text: q, conversationId: conversationId.current }),
      });
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "⚠️ Network error — please try again." }]);
      setBusy(false);
      return;
    }
    if (!res.body) {
      setBusy(false);
      setStatus("");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantText = "";
    let gotAudio = false;
    let gotVideo = false;

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
            setStatus(`looking up ${ev.name.replace(/_/g, " ")}…`);
            break;
          case "text":
            assistantText = ev.text;
            setMessages((m) => [...m, { role: "assistant", text: ev.text }]);
            break;
          case "audio":
            gotAudio = true;
            if (audioRef.current) {
              audioRef.current.src = ev.url;
              audioRef.current.play().catch(() => {
                // Autoplay blocked — fall back to browser voice so it still talks.
                speakBrowser(assistantText);
              });
            }
            break;
          case "video":
            gotVideo = true;
            setVideoUrl(ev.url);
            break;
          case "error":
            setMessages((m) => [...m, { role: "assistant", text: `⚠️ ${ev.message}` }]);
            break;
        }
      }
    }

    // If the server produced no audio/video, speak the reply in the browser
    // so the avatar visibly talks regardless of TTS configuration.
    if (!gotAudio && !gotVideo && assistantText) {
      speakBrowser(assistantText);
    }
    setStatus("");
    setBusy(false);
  }

  // When a lip-sync video arrives, play it instead of the still + audio.
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      if (audioRef.current) audioRef.current.pause();
      videoRef.current.src = videoUrl;
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl]);

  function toggleMic() {
    if (demoOff) {
      setStatus("Live demo is off");
      setMessages((m) => [...m, { role: "assistant", text: DEMO_OFF_MSG }]);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setStatus("Voice input needs Chrome/Edge — please type instead.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let finalTranscript = "";
    rec.onresult = (e: { results: { isFinal: boolean; [k: number]: { transcript: string } }[] }) => {
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscript += t;
        else interim += t;
      }
      setStatus(`heard: ${(finalTranscript || interim).slice(0, 40)}`);
    };
    rec.onerror = (e: { error?: string }) => {
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setStatus("Microphone blocked — allow mic access in your browser.");
      } else if (e.error === "no-speech") {
        setStatus("Didn't catch that — tap the mic and try again.");
      } else {
        setStatus("Voice input error — please type instead.");
      }
    };
    rec.onend = () => {
      setListening(false);
      const q = finalTranscript.trim();
      if (q) {
        setStatus("");
        send(q);
      }
    };
    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
      setStatus("listening…");
    } catch {
      setStatus("Could not start the microphone.");
    }
  }

  const showVideo = Boolean(videoUrl);

  return (
    <div className="mx-auto flex w-full max-w-[380px] flex-col gap-3">
      {/* iPhone-shaped avatar stage */}
      <div className="relative mx-auto w-full overflow-hidden rounded-[2.5rem] border-[10px] border-slate-900 bg-black shadow-2xl">
        <div className="relative aspect-[9/19] w-full bg-gradient-to-b from-slate-900 to-slate-700">
          {/* notch */}
          <div className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-slate-900" />

          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            playsInline
            className={`absolute inset-0 h-full w-full object-cover ${showVideo ? "block" : "hidden"}`}
            onEnded={() => setVideoUrl("")}
          />
          {!showVideo &&
            (portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitUrl}
                alt={name}
                className={`absolute inset-0 h-full w-full object-cover transition-transform ${
                  talking ? "animate-talk" : busy ? "animate-float" : ""
                }`}
              />
            ) : (
              <div className="grid h-full place-items-center text-7xl text-white">🧑‍🏫</div>
            ))}

          {/* speaking indicator */}
          {talking && (
            <div className="absolute right-3 top-8 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-lg talk-ring">
              🔊
            </div>
          )}

          {/* name + status overlay */}
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent px-4 pb-5 pt-12 text-center">
            <p className="text-lg font-semibold text-white drop-shadow">{name}</p>
            <p className="h-4 text-xs text-indigo-200">{status || (talking ? "speaking…" : "")}</p>
          </div>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio
            ref={audioRef}
            className="hidden"
            onPlay={() => setTalking(true)}
            onEnded={() => setTalking(false)}
            onPause={() => setTalking(false)}
          />
        </div>
      </div>

      {/* Chatbox below the phone */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
        {demoOff && (
          <div className="flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Live demo is currently off — <a href="#enquire" className="underline hover:text-amber-900">book a free demo</a>
          </div>
        )}
        {/* Mode toggle */}
        <div className="flex gap-1 border-b border-slate-100 p-2">
          <button
            onClick={() => setMode("text")}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
              mode === "text" ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            ⌨️ Text
          </button>
          <button
            onClick={() => {
              setMode("voice");
            }}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
              mode === "voice" ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            🎙 Voice
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="h-44 space-y-3 overflow-y-auto bg-slate-50 p-4">
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

        {/* Suggested test prompts */}
        <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-white px-3 py-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={busy}
              className="shrink-0 rounded-full border border-brand/30 bg-indigo-50 px-3 py-1 text-xs text-brand hover:bg-indigo-100 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Composer */}
        {mode === "text" ? (
          <div className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask about our courses…"
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
        ) : (
          <div className="flex flex-col items-center gap-2 border-t border-slate-200 bg-white p-4">
            <button
              onClick={toggleMic}
              disabled={busy}
              className={`grid h-16 w-16 place-items-center rounded-full text-2xl text-white disabled:opacity-60 ${
                listening ? "bg-red-600 talk-ring" : "bg-brand hover:bg-brand-600"
              }`}
              title="Tap to speak"
            >
              🎙
            </button>
            <span className="text-xs text-slate-500">
              {listening ? "Listening… tap to stop" : busy ? "Please wait…" : "Tap to speak"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function statusLabel(stage: string): string {
  if (stage === "thinking") return "thinking…";
  if (stage === "speaking") return "generating voice…";
  if (stage === "rendering") return "animating…";
  if (stage.startsWith("tts-failed")) return "using browser voice (configure MiniMax for cloned voice)";
  return "";
}
