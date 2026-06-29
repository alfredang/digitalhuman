import { getSettingsForAdmin } from "@/lib/settings";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettingsForAdmin();
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        API keys are encrypted at rest. Secrets are never sent back to the browser — leave a secret field blank to keep
        the current value.
      </p>
      <SettingsForm initial={settings} />
    </div>
  );
}
