import { getSetting } from "@/lib/settings";
import { toAbsoluteUrl } from "@/lib/storage";

// Turn-based talking-head rendering. The avatar engine is swappable: today we
// call inference.sh (OmniHuman / Fabric); a GPU MuseTalk service could implement
// the same interface later. Rendering is an ENHANCEMENT — if it fails or is not
// configured, the caller falls back to audio + a static portrait.

export interface AvatarRenderer {
  renderTalkingClip(input: { portraitUrl: string; audioUrl: string }): Promise<string | null>;
}

class InferenceShRenderer implements AvatarRenderer {
  async renderTalkingClip({ portraitUrl, audioUrl }: { portraitUrl: string; audioUrl: string }): Promise<string | null> {
    const token = await getSetting("INFERENCE_SH_TOKEN");
    if (!token) return null;
    const app = (await getSetting("AVATAR_RENDERER_APP")) || "bytedance/omnihuman-1-5";

    const body = {
      app,
      input: { image_url: toAbsoluteUrl(portraitUrl), audio_url: toAbsoluteUrl(audioUrl) },
    };

    try {
      const res = await fetch("https://api.inference.sh/apps/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        console.error("inference.sh run failed", res.status, (await res.text()).slice(0, 300));
        return null;
      }
      const data = await res.json();
      const direct = extractVideoUrl(data);
      if (direct) return direct;

      // Async task — poll for completion.
      const taskId = data?.id ?? data?.task_id ?? data?.task?.id;
      if (taskId) return await this.poll(String(taskId), token);
      return null;
    } catch (e) {
      console.error("inference.sh render error", (e as Error).message);
      return null;
    }
  }

  private async poll(taskId: string, token: string): Promise<string | null> {
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const res = await fetch(`https://api.inference.sh/apps/run/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) continue;
        const data = await res.json();
        const url = extractVideoUrl(data);
        if (url) return url;
        const status = (data?.status ?? "").toString().toLowerCase();
        if (status === "failed" || status === "error" || status === "cancelled") return null;
      } catch {
        /* keep polling */
      }
    }
    return null;
  }
}

/** Best-effort extraction of a video URL from various inference.sh response shapes. */
function extractVideoUrl(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  const candidates = [
    obj.output,
    (obj.output as Record<string, unknown>)?.video,
    (obj.output as Record<string, unknown>)?.video_url,
    (obj.output as Record<string, unknown>)?.url,
    (obj.result as Record<string, unknown>)?.video,
    (obj.result as Record<string, unknown>)?.url,
    obj.video_url,
    obj.url,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && /^https?:\/\/.+\.(mp4|webm|mov)/i.test(c)) return c;
    if (typeof c === "string" && /^https?:\/\//.test(c) && /video|mp4|render/i.test(c)) return c;
  }
  return null;
}

let renderer: AvatarRenderer | null = null;
export function getRenderer(): AvatarRenderer {
  if (!renderer) renderer = new InferenceShRenderer();
  return renderer;
}
