import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSettingsForAdmin, setSetting, SETTING_KEYS, SECRET_KEYS, type SettingKey } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(await getSettingsForAdmin());
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as Record<string, string>;
  const validKeys = Object.keys(SETTING_KEYS) as SettingKey[];

  for (const [key, value] of Object.entries(body)) {
    if (!validKeys.includes(key as SettingKey)) continue;
    // For secret fields, ignore empty/placeholder values so we don't overwrite an existing secret.
    if (SECRET_KEYS.includes(key as SettingKey) && (value === "" || value === "••••••••")) continue;
    if (typeof value !== "string") continue;
    await setSetting(key as SettingKey, value.trim());
  }
  return NextResponse.json(await getSettingsForAdmin());
}
