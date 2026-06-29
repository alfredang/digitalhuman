import Link from "next/link";
import {
  GraduationCap, ShoppingBag, Landmark, HeartPulse, Hotel, Building2, Home as HomeIcon, RadioTower,
  Mic, Video, Languages, BrainCircuit, Code2, Camera, CheckCircle2, type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import ChatWidget from "@/components/ChatWidget";
import LeadForm from "@/components/LeadForm";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export const dynamic = "force-dynamic";

const INDUSTRIES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: GraduationCap, title: "Education", desc: "Course advisors, 24/7 student support, multilingual onboarding and tutoring." },
  { icon: ShoppingBag, title: "Retail & E-commerce", desc: "Virtual shopping assistants that recommend products and answer FAQs instantly." },
  { icon: Landmark, title: "Finance & Banking", desc: "Explain products, pre-qualify leads, and guide customers through applications." },
  { icon: HeartPulse, title: "Healthcare", desc: "Appointment guidance, patient FAQs, and pre-visit triage in any language." },
  { icon: Hotel, title: "Hospitality & Travel", desc: "Concierge avatars for bookings, local tips, and round-the-clock guest service." },
  { icon: Building2, title: "Government & Public", desc: "Accessible service kiosks that explain schemes and answer citizen queries." },
  { icon: HomeIcon, title: "Real Estate", desc: "Lifelike agents that qualify buyers and walk through listings on your site." },
  { icon: RadioTower, title: "Telecom & Utilities", desc: "Deflect support tickets with avatars that handle plans, billing and outages." },
];

const CAPABILITIES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Mic, title: "Natural voice", desc: "Sub-second, expressive speech with voice cloning via MiniMax Speech 2.8." },
  { icon: Video, title: "Realistic lip-sync", desc: "Talking-head video so the avatar looks and feels human." },
  { icon: Languages, title: "40+ languages", desc: "One avatar serves multilingual audiences — no separate stacks." },
  { icon: BrainCircuit, title: "Agentic & grounded", desc: "Answers from your real content; can look things up and book consultations." },
  { icon: Code2, title: "Embed anywhere", desc: "Drop one line of script onto any website — live in minutes." },
  { icon: Camera, title: "Build from a photo", desc: "Create a presenter from a single photo, webcam capture or short clip." },
];

export default async function Home() {
  const demoEnabled = (await getSetting("DEMO_ENABLED")) === "true";
  const readyAvatar = await prisma.avatar.findFirst({ where: { status: "READY" }, orderBy: { createdAt: "asc" } });
  // Only expose the live demo when the admin has explicitly enabled it (keeps the
  // public page from burning API tokens on spam while the demo is switched off).
  const demoAvatar = demoEnabled ? readyAvatar : null;

  return (
    <div className="bg-white text-slate-800">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tertiary-logo.png" alt="Tertiary Training" className="h-8 w-8" />
            <span className="font-bold">Tertiary<span className="text-brand">Training</span></span>
          </a>
          <nav className="flex items-center gap-4 text-sm">
            <a href="#industries" className="hidden hover:text-brand sm:inline">Industries</a>
            <a href="#capabilities" className="hidden hover:text-brand sm:inline">Features</a>
            <Link href="/blog" className="hidden hover:text-brand sm:inline">Blog</Link>
            <Link href="/login" className="hidden text-slate-500 hover:text-brand sm:inline">Admin</Link>
            <a href="#enquire" className="rounded-lg bg-brand px-3 py-1.5 font-medium text-white hover:bg-brand-600">Book a demo</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 to-white">
        <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 pb-12 pt-10 lg:grid-cols-2">
          <div className="lg:pt-8">
            <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-medium text-brand ring-1 ring-indigo-100">
              Enterprise AI Digital Humans · Powered by MiniMax M3 or Google Gemini
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              We build your <span className="text-brand">24/7 AI digital human</span> — you just embed it.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              A done-for-you service: we create your branded avatar, clone your voice, train it on your knowledge
              (RAG), and hand you an embed link for your website. Lifelike, voice-enabled customer service &amp;
              presenting in 40+ languages — for education, retail, finance and beyond.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#enquire" className="rounded-xl bg-brand px-5 py-3 font-medium text-white shadow-sm hover:bg-brand-600">
                Book a free demo
              </a>
              {demoAvatar && (
                <a href="#demo" className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium hover:bg-slate-50">
                  Talk to a live avatar
                </a>
              )}
            </div>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-4">
              {[["40+", "languages"], ["24/7", "availability"], ["1-line", "to embed"]].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-200">
                  <span className="block text-xl font-bold text-brand">{n}</span>
                  <span className="text-xs text-slate-500">{l}</span>
                </div>
              ))}
            </div>

            {/* What's included — fills the space beside the tall avatar */}
            <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
              {[
                "Fully managed — we build & host it",
                "Your branded avatar & cloned voice",
                "Trained on your content (RAG)",
                "One-line embed for any website",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" strokeWidth={2} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <p className="mt-7 text-sm font-semibold text-slate-700">Use it for</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Customer service", "Sales & lead-gen", "Onboarding", "Training", "Reception / kiosk", "Product demos"].map((t) => (
                <span key={t} className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-brand ring-1 ring-indigo-100">{t}</span>
              ))}
            </div>

            {/* Try it live — sits below 'Use it for', pointing right to the avatar */}
            {demoAvatar && (
              <div id="demo" className="mt-8 rounded-3xl bg-gradient-to-br from-brand to-indigo-700 p-6 text-white shadow-xl ring-1 ring-brand/30 sm:p-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
                  </span>
                  Live demo
                </span>
                <h2 className="mt-3 text-2xl font-extrabold leading-snug sm:text-3xl">Try it live, right now →</h2>
                <p className="mt-2 text-sm text-indigo-100 sm:text-base">
                  Speak or type to the demo avatar — it listens, looks things up, and replies out loud. The same widget
                  you can embed on your own site.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={`/chat/${demoAvatar.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-brand shadow-sm transition hover:bg-indigo-50"
                  >
                    💬 Chat with the avatar
                  </a>
                  <a
                    href="#enquire"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/20"
                  >
                    Book a demo →
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="lg:pl-6">
            {readyAvatar ? (
              // Always show the avatar. When the demo is switched off (DEMO_ENABLED=false),
              // the widget renders read-only: sending text or using voice replies with a
              // "demo currently off" notice instead of calling the chat API.
              <ChatWidget
                avatarId={readyAvatar.id}
                name={readyAvatar.name}
                greeting={readyAvatar.greeting}
                portraitUrl={readyAvatar.portraitUrl ?? undefined}
                compact
                demoOff={!demoEnabled}
              />
            ) : (
              <div className="grid h-[520px] place-items-center rounded-2xl bg-slate-50 text-center ring-1 ring-slate-200">
                <div className="px-6">
                  <p className="text-5xl">🧑‍🏫</p>
                  <p className="mt-4 font-medium">No avatar yet</p>
                  <Link href="/login" className="mt-2 inline-block text-brand hover:underline">Go to admin →</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">One avatar platform, every industry</h2>
            <p className="mx-auto mt-2 max-w-2xl text-slate-600">
              Deploy a branded digital human that serves, sells and presents — wherever your customers are.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {INDUSTRIES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-brand">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Everything you need for a lifelike presenter</h2>
            <p className="mx-auto mt-2 max-w-2xl text-slate-600">Voice, video, languages and grounding — production-ready.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-brand">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — the done-for-you service */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">How our service works</h2>
            <p className="mx-auto mt-2 max-w-2xl text-slate-600">
              You bring the photo, voice and content — we deliver a ready-to-embed digital human. No engineering on your side.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["1", "Create your avatar", "We build a lifelike avatar from a single photo, webcam capture or short video of your presenter."],
              ["2", "Clone your voice", "We clone your brand voice (or pick from 40+ languages & presets) so it sounds authentically you."],
              ["3", "Train on your knowledge", "We add your courses, products or FAQs as a knowledge base (RAG) so answers are accurate and on-brand."],
              ["4", "Embed on your site", "We hand you a one-line embed snippet. Drop it on any website and your digital human is live 24/7."],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-brand font-bold text-white">{n}</div>
                <h3 className="mt-4 font-semibold text-slate-900">{t}</h3>
                <p className="mt-1 text-sm text-slate-600">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            Fully managed — we handle hosting, the AI models and updates. You focus on your customers.
          </p>
        </div>
      </section>

      {/* Enquiry / lead magnet */}
      <section id="enquire" className="bg-slate-900 py-12">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 lg:grid-cols-2">
          <div className="text-white">
            <h2 className="text-3xl font-bold">See your own digital human in action</h2>
            <p className="mt-3 text-indigo-100">
              Book a free, no-obligation demo. We&apos;ll show a lifelike AI avatar tailored to your industry — customer
              service, sales or presenting — and answer your questions.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-indigo-100">
              <li>✓ Personalised to your use case</li>
              <li>✓ Multilingual &amp; voice-enabled</li>
              <li>✓ We reply within 3 business days</li>
            </ul>
          </div>
          <LeadForm />
        </div>
      </section>

      <SiteFooter />
      <WhatsAppWidget />
    </div>
  );
}
