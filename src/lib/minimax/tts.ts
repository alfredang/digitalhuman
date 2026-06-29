import { getSetting } from "@/lib/settings";
import { saveBuffer } from "@/lib/storage";

// MiniMax Speech 2.8 Turbo (T2A v2) + voice cloning.
// Docs shape: POST {base}/t2a_v2?GroupId=...  and  /files/upload + /voice_clone.

async function ttsConfig() {
  const apiKey = await getSetting("MINIMAX_API_KEY");
  const groupId = await getSetting("MINIMAX_GROUP_ID");
  const baseUrl = ((await getSetting("MINIMAX_BASE_URL")) || "https://api.minimax.io/v1").replace(/\/$/, "");
  const model = (await getSetting("MINIMAX_TTS_MODEL")) || "speech-2.8-turbo";
  if (!apiKey) throw new Error("MiniMax API key is not configured.");
  return { apiKey, groupId, baseUrl, model };
}

// Only the China endpoint (api.minimaxi.com) uses the GroupId query param.
// The international endpoint (api.minimax.io) authenticates by Bearer token
// alone — passing GroupId there causes "token not match group" (1004).
function withGroup(url: string, groupId?: string) {
  const isChina = /minimaxi\.com/i.test(url);
  return isChina && groupId ? `${url}${url.includes("?") ? "&" : "?"}GroupId=${encodeURIComponent(groupId)}` : url;
}

export type SynthOptions = {
  voiceId?: string; // cloned or preset voice
  speed?: number;
  emotion?: string; // e.g. "happy" | "neutral"
  language?: string; // language_boost, e.g. "English"
};

const DEFAULT_VOICE_ID = "female-tianmei";

/**
 * Synthesize speech and persist it. Returns a public audio URL.
 */
export async function synthesize(text: string, opts: SynthOptions = {}): Promise<string> {
  const { apiKey, groupId, baseUrl, model } = await ttsConfig();
  const res = await fetch(withGroup(`${baseUrl}/t2a_v2`, groupId), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      text,
      stream: false,
      ...(opts.language && opts.language !== "auto" ? { language_boost: opts.language } : {}),
      voice_setting: {
        voice_id: opts.voiceId || DEFAULT_VOICE_ID,
        speed: opts.speed ?? 1.0,
        vol: 1.0,
        pitch: 0,
        ...(opts.emotion ? { emotion: opts.emotion } : {}),
      },
      audio_setting: { sample_rate: 32000, bitrate: 128000, format: "mp3", channel: 1 },
    }),
  });
  if (!res.ok) throw new Error(`MiniMax TTS error ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const data = await res.json();
  const hex: string | undefined = data?.data?.audio;
  if (!hex) throw new Error(`MiniMax TTS returned no audio: ${JSON.stringify(data).slice(0, 300)}`);
  const buf = Buffer.from(hex, "hex");
  return saveBuffer(buf, { ext: ".mp3", contentType: "audio/mpeg", prefix: "tts" });
}

/** Generate a MiniMax-valid voice id (letters + at least one digit, 8+ chars). */
function makeVoiceId() {
  return `voice${Math.floor(Date.now() / 1000)}x`;
}

/**
 * Clone a voice from a short sample (fetchable URL). Returns the new voice_id.
 */
export async function cloneVoice(sampleAbsoluteUrl: string): Promise<string> {
  const { apiKey, groupId, baseUrl } = await ttsConfig();

  // 1) Download the sample and upload it to MiniMax files.
  const sample = await fetch(sampleAbsoluteUrl);
  if (!sample.ok) throw new Error(`Could not fetch voice sample (${sample.status})`);
  const sampleBuf = Buffer.from(await sample.arrayBuffer());
  const fd = new FormData();
  fd.append("purpose", "voice_clone");
  fd.append("file", new Blob([sampleBuf], { type: "audio/mpeg" }), "sample.mp3");

  const up = await fetch(withGroup(`${baseUrl}/files/upload`, groupId), {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: fd,
  });
  if (!up.ok) throw new Error(`MiniMax file upload error ${up.status}: ${(await up.text()).slice(0, 300)}`);
  const upData = await up.json();
  const fileId = upData?.file?.file_id ?? upData?.file_id;
  if (!fileId) throw new Error(`MiniMax upload returned no file_id: ${JSON.stringify(upData).slice(0, 300)}`);

  // 2) Clone.
  const voiceId = makeVoiceId();
  const clone = await fetch(withGroup(`${baseUrl}/voice_clone`, groupId), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ file_id: fileId, voice_id: voiceId }),
  });
  if (!clone.ok) throw new Error(`MiniMax voice clone error ${clone.status}: ${(await clone.text()).slice(0, 300)}`);
  return voiceId;
}
