import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";
import { getSetting } from "@/lib/settings";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

// "Prehook": strict server-side validation before anything is stored.
const leadSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(120),
  email: z.string().email("Please enter a valid email").max(160),
  company: z.string().max(160).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  interest: z.string().max(2000).optional().or(z.literal("")),
  // honeypot — bots fill this; humans never see it
  website: z.string().max(0).optional(),
});

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  // Public, unauthenticated, and triggers outbound email — throttle per IP.
  if (!rateLimit(`leads:${clientIp(req)}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": "60" } });
  }

  const parsed = leadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  if (parsed.data.website) {
    // Honeypot tripped — pretend success, store nothing.
    return NextResponse.json({ ok: true });
  }
  const { name, email, company, phone, interest } = parsed.data;

  const lead = await prisma.lead.create({
    data: { name, email, company: company || null, phone: phone || null, interest: interest || null },
  });

  // Best-effort notifications (never block the lead capture on email).
  const notify = (await getSetting("LEAD_NOTIFY_EMAIL")) || "angch@tertiaryinfotech.com";
  const when = new Date(lead.createdAt).toUTCString();
  sendMail({
    to: notify,
    replyTo: email,
    subject: `🎯 New Digital Human Demo enquiry — ${name}`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#4f46e5;margin-bottom:4px">New Digital Human Demo Enquiry</h2>
        <p style="color:#64748b;margin-top:0">Submitted via tertiarytraining.com</p>
        <table cellpadding="8" style="border-collapse:collapse;width:100%;font-size:14px">
          <tr><td style="background:#f8fafc;font-weight:bold;width:130px">Name</td><td>${esc(name)}</td></tr>
          <tr><td style="background:#f8fafc;font-weight:bold">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
          <tr><td style="background:#f8fafc;font-weight:bold">Company</td><td>${esc(company || "—")}</td></tr>
          <tr><td style="background:#f8fafc;font-weight:bold">Phone</td><td>${esc(phone || "—")}</td></tr>
          <tr><td style="background:#f8fafc;font-weight:bold;vertical-align:top">Interest</td><td>${esc(interest || "—")}</td></tr>
          <tr><td style="background:#f8fafc;font-weight:bold">Received</td><td>${esc(when)}</td></tr>
        </table>
      </div>`,
  }).catch(() => {});

  // "Posthook": acknowledge the enquirer.
  sendMail({
    to: email,
    subject: "Thanks for your interest in a Digital Human demo — Tertiary Training",
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#4f46e5">Thank you, ${esc(name)}!</h2>
        <p>We've received your request for a <strong>Digital Human demo</strong>. Our team will review it and get back to you within <strong>3 business days</strong>.</p>
        <p>In the meantime, you can chat live with our AI course advisor at
          <a href="https://www.tertiarytraining.com">tertiarytraining.com</a>.</p>
        <p style="color:#64748b;font-size:13px;margin-top:24px">Tertiary Infotech Academy Pte Ltd · +65 6100 0613 · enquiry@tertiaryinfotech.com</p>
      </div>`,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}
