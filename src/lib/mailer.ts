import nodemailer from "nodemailer";
import { getSetting } from "./settings";

// Best-effort transactional email via SMTP. If SMTP isn't configured, sending
// is a no-op (returns false) — callers must still persist the data regardless.

export async function getMailer() {
  const host = await getSetting("SMTP_HOST");
  const user = await getSetting("SMTP_USER");
  const pass = await getSetting("SMTP_PASS");
  if (!host || !user || !pass) return null;
  const port = Number((await getSetting("SMTP_PORT")) || "587");
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendMail(opts: { to: string; subject: string; html: string; replyTo?: string }): Promise<boolean> {
  const transport = await getMailer();
  if (!transport) return false;
  const from = (await getSetting("SMTP_FROM")) || (await getSetting("SMTP_USER"))!;
  try {
    await transport.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html, replyTo: opts.replyTo });
    return true;
  } catch (e) {
    console.error("sendMail failed:", (e as Error).message);
    return false;
  }
}
