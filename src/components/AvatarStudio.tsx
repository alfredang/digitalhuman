"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VOICES, LANGUAGES, DEFAULT_VOICE_ID } from "@/lib/minimax/voices";

type Tab = "upload" | "webcam" | "video";

async function uploadBlob(blob: Blob, filename: string, prefix: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", blob, filename);
  fd.append("prefix", prefix);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Upload failed");
  return (await res.json()).url as string;
}

export default function AvatarStudio() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("upload");

  const [name, setName] = useState("");
  const [persona, setPersona] = useState(
    "You are a warm, professional course advisor for Tertiary Infotech. You help learners choose WSQ and professional IT courses, explain content, fees and schedules, and encourage enrolment. Keep answers concise and friendly.",
  );
  const [greeting, setGreeting] = useState("Hi! I'm your Tertiary Infotech course advisor. What would you like to learn?");

  const [portraitUrl, setPortraitUrl] = useState<string>("");
  const [sourceMediaUrl, setSourceMediaUrl] = useState<string>("");
  const [sourceType, setSourceType] = useState<"PHOTO" | "VIDEO">("PHOTO");

  const [voiceSampleUrl, setVoiceSampleUrl] = useState<string>("");
  const [voiceId, setVoiceId] = useState<string>(DEFAULT_VOICE_ID);
  const [language, setLanguage] = useState<string>("English");
  const [knowledge, setKnowledge] = useState<{ title: string; content: string }[]>([]);

  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  /* ---------------- Webcam ---------------- */
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function startWebcam(withAudio = false) {
    stopWebcam();
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: withAudio });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => {});
    }
  }
  function stopWebcam() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }
  useEffect(() => () => stopWebcam(), []);

  async function captureFrame() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/jpeg", 0.92));
    setBusy("Uploading photo…");
    try {
      const url = await uploadBlob(blob, "capture.jpg", "portraits");
      setPortraitUrl(url);
      setSourceMediaUrl(url);
      setSourceType("PHOTO");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  /* ---------------- Video recording ---------------- */
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);

  async function startVideoRecording() {
    await startWebcam(true);
    chunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current!, { mimeType: pickMime(["video/webm;codecs=vp9,opus", "video/webm", "video/mp4"]) });
    mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: mr.mimeType });
      setBusy("Uploading video…");
      try {
        const url = await uploadBlob(blob, "source.webm", "videos");
        setSourceMediaUrl(url);
        setSourceType("VIDEO");
        // grab a poster frame for the portrait
        const frame = await frameFromVideoBlob(blob);
        if (frame) {
          const purl = await uploadBlob(frame, "poster.jpg", "portraits");
          setPortraitUrl(purl);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy("");
      }
    };
    mr.start();
    recorderRef.current = mr;
    setRecording(true);
    // auto-stop after 8s to keep it short
    setTimeout(() => stopVideoRecording(), 8000);
  }
  function stopVideoRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    setRecording(false);
    stopWebcam();
  }

  /* ---------------- Voice sample ---------------- */
  const audioRecRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordingVoice, setRecordingVoice] = useState(false);

  async function startVoice() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunksRef.current = [];
    const mr = new MediaRecorder(stream, { mimeType: pickMime(["audio/webm", "audio/mp4"]) });
    mr.ondataavailable = (e) => e.data.size && audioChunksRef.current.push(e.data);
    mr.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(audioChunksRef.current, { type: mr.mimeType });
      setBusy("Uploading voice sample…");
      try {
        setVoiceSampleUrl(await uploadBlob(blob, "voice.webm", "voice-samples"));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy("");
      }
    };
    mr.start();
    audioRecRef.current = mr;
    setRecordingVoice(true);
  }
  function stopVoice() {
    audioRecRef.current?.stop();
    setRecordingVoice(false);
  }

  /* ---------------- File upload ---------------- */
  async function onFile(e: React.ChangeEvent<HTMLInputElement>, kind: "image" | "voice") {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy("Uploading…");
    try {
      const url = await uploadBlob(file, file.name, kind === "image" ? "portraits" : "voice-samples");
      if (kind === "image") {
        setPortraitUrl(url);
        setSourceMediaUrl(url);
        setSourceType("PHOTO");
      } else {
        setVoiceSampleUrl(url);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy("");
    }
  }

  /* ---------------- Save ---------------- */
  async function save() {
    setError("");
    if (!name.trim()) return setError("Please give your avatar a name.");
    if (!portraitUrl) return setError("Please capture or upload a portrait.");
    setBusy("Creating avatar…");
    try {
      const res = await fetch("/api/avatars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, persona, greeting, portraitUrl, sourceMediaUrl, sourceType, voiceId, language, knowledge }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to create avatar");
      const avatar = await res.json();

      if (voiceSampleUrl) {
        setBusy("Cloning voice (this can take a moment)…");
        await fetch(`/api/avatars/${avatar.id}/voice-clone`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sampleUrl: voiceSampleUrl }),
        }).catch(() => {});
      }
      router.push(`/admin/avatars/${avatar.id}`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy("");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* LEFT: capture */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Create avatar</h1>

        <div>
          <label className="text-sm font-medium text-slate-700">Avatar name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aisha — Course Advisor"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex gap-2 text-sm">
            {(["upload", "webcam", "video"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  if (t === "webcam") startWebcam(false);
                  else stopWebcam();
                }}
                className={`rounded-md px-3 py-1.5 ${tab === t ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {t === "upload" ? "Upload photo" : t === "webcam" ? "Webcam photo" : "Record video"}
              </button>
            ))}
          </div>

          {tab === "upload" && (
            <input type="file" accept="image/*" onChange={(e) => onFile(e, "image")} className="text-sm" />
          )}

          {(tab === "webcam" || tab === "video") && (
            <div className="space-y-3">
              <video ref={videoRef} muted playsInline className="aspect-video w-full rounded-lg bg-black object-cover" />
              {tab === "webcam" ? (
                <button onClick={captureFrame} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
                  📸 Capture photo
                </button>
              ) : recording ? (
                <button onClick={stopVideoRecording} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">
                  ■ Stop recording
                </button>
              ) : (
                <button onClick={startVideoRecording} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
                  ● Record 8s clip
                </button>
              )}
            </div>
          )}
        </div>

        {/* Voice */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-700">Voice &amp; language</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-slate-500">Voice</span>
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
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
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Language</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-3 text-xs text-slate-500">Or clone a custom voice from a ~10s sample (overrides the preset):</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {recordingVoice ? (
              <button onClick={stopVoice} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">
                ■ Stop
              </button>
            ) : (
              <button onClick={startVoice} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
                🎙 Record voice
              </button>
            )}
            <span className="text-xs text-slate-400">or</span>
            <input type="file" accept="audio/*" onChange={(e) => onFile(e, "voice")} className="text-sm" />
            {voiceSampleUrl && <span className="text-xs text-green-600">✓ sample ready</span>}
          </div>
        </div>
      </div>

      {/* RIGHT: persona + preview */}
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-700">Portrait preview</p>
          <div className="mt-2 aspect-square w-40 overflow-hidden rounded-lg bg-slate-100">
            {portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={portraitUrl} alt="portrait" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-xs text-slate-400">none yet</div>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Persona / system prompt</label>
          <textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Greeting</label>
          <input
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <KnowledgeEditor knowledge={knowledge} setKnowledge={setKnowledge} />

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={save}
          disabled={!!busy}
          className="w-full rounded-lg bg-brand py-2.5 font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {busy || "Create avatar"}
        </button>
      </div>
    </div>
  );
}

function KnowledgeEditor({
  knowledge,
  setKnowledge,
}: {
  knowledge: { title: string; content: string }[];
  setKnowledge: (k: { title: string; content: string }[]) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Course knowledge (grounding)</p>
        <button
          onClick={() => setKnowledge([...knowledge, { title: "", content: "" }])}
          className="text-sm text-brand hover:underline"
        >
          + Add
        </button>
      </div>
      <div className="mt-3 space-y-3">
        {knowledge.length === 0 && (
          <p className="text-xs text-slate-400">Paste course descriptions, fees, schedules — the avatar answers from these.</p>
        )}
        {knowledge.map((k, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-2">
            <input
              value={k.title}
              onChange={(e) => {
                const next = [...knowledge];
                next[i] = { ...k, title: e.target.value };
                setKnowledge(next);
              }}
              placeholder="Title (e.g. Python WSQ course)"
              className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
            />
            <textarea
              value={k.content}
              onChange={(e) => {
                const next = [...knowledge];
                next[i] = { ...k, content: e.target.value };
                setKnowledge(next);
              }}
              rows={3}
              placeholder="Content…"
              className="mt-2 w-full rounded border border-slate-200 px-2 py-1 text-sm"
            />
            <button
              onClick={() => setKnowledge(knowledge.filter((_, j) => j !== i))}
              className="mt-1 text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function pickMime(candidates: string[]): string {
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) return c;
  }
  return "";
}

async function frameFromVideoBlob(blob: Blob): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.src = URL.createObjectURL(blob);
    video.onloadeddata = () => {
      video.currentTime = Math.min(0.5, video.duration / 2 || 0.5);
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92);
    };
    video.onerror = () => resolve(null);
  });
}
