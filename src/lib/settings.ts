import { prisma } from "./db";
import { decrypt, encrypt } from "./crypto";

// Known setting keys + their env fallback variable.
export const SETTING_KEYS = {
  // Which LLM powers the dialogue layer: "minimax" | "gemini"
  LLM_PROVIDER: "LLM_PROVIDER",
  // MiniMax
  MINIMAX_API_KEY: "MINIMAX_API_KEY",
  MINIMAX_GROUP_ID: "MINIMAX_GROUP_ID",
  MINIMAX_BASE_URL: "MINIMAX_BASE_URL",
  MINIMAX_CHAT_MODEL: "MINIMAX_CHAT_MODEL",
  MINIMAX_TTS_MODEL: "MINIMAX_TTS_MODEL",
  MINIMAX_EMBED_MODEL: "MINIMAX_EMBED_MODEL",
  // Google Gemini (OpenAI-compatible endpoint)
  GEMINI_API_KEY: "GEMINI_API_KEY",
  GEMINI_BASE_URL: "GEMINI_BASE_URL",
  GEMINI_CHAT_MODEL: "GEMINI_CHAT_MODEL",
  // Avatar lip-sync
  INFERENCE_SH_TOKEN: "INFERENCE_SH_TOKEN",
  AVATAR_RENDERER_APP: "AVATAR_RENDERER_APP", // inference.sh app id
  // Email (lead notifications) — SMTP
  SMTP_HOST: "SMTP_HOST",
  SMTP_PORT: "SMTP_PORT",
  SMTP_USER: "SMTP_USER",
  SMTP_PASS: "SMTP_PASS",
  SMTP_FROM: "SMTP_FROM",
  LEAD_NOTIFY_EMAIL: "LEAD_NOTIFY_EMAIL",
} as const;

export type SettingKey = keyof typeof SETTING_KEYS;

const DEFAULTS: Partial<Record<SettingKey, string>> = {
  LLM_PROVIDER: "minimax",
  MINIMAX_BASE_URL: "https://api.minimax.io/v1",
  MINIMAX_CHAT_MODEL: "MiniMax-M3",
  MINIMAX_TTS_MODEL: "speech-2.8-turbo",
  MINIMAX_EMBED_MODEL: "embo-01",
  GEMINI_BASE_URL: "https://generativelanguage.googleapis.com/v1beta/openai",
  GEMINI_CHAT_MODEL: "gemini-2.0-flash",
  AVATAR_RENDERER_APP: "bytedance/omnihuman-1-5",
  SMTP_PORT: "587",
  LEAD_NOTIFY_EMAIL: "angch@tertiaryinfotech.com",
};

// Keys that are secrets — never returned to the client in plaintext.
export const SECRET_KEYS: SettingKey[] = ["MINIMAX_API_KEY", "GEMINI_API_KEY", "INFERENCE_SH_TOKEN", "SMTP_PASS"];

/** Get a setting: DB (decrypted) first, then env var, then built-in default. */
export async function getSetting(key: SettingKey): Promise<string | undefined> {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (row?.valueEncrypted) {
    try {
      const v = decrypt(row.valueEncrypted);
      if (v) return v;
    } catch {
      /* fall through to env */
    }
  }
  return process.env[key] || DEFAULTS[key];
}

export async function setSetting(key: SettingKey, value: string): Promise<void> {
  const valueEncrypted = encrypt(value);
  await prisma.setting.upsert({
    where: { key },
    update: { valueEncrypted },
    create: { key, valueEncrypted },
  });
}

/** Settings view for the admin UI: secrets shown only as "set / not set". */
export async function getSettingsForAdmin() {
  const out: Record<string, { value: string; secret: boolean; isSet: boolean }> = {};
  for (const key of Object.keys(SETTING_KEYS) as SettingKey[]) {
    const v = await getSetting(key);
    const secret = SECRET_KEYS.includes(key);
    out[key] = {
      value: secret ? "" : v ?? "",
      secret,
      isSet: Boolean(v),
    };
  }
  return out;
}
