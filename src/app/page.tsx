import Link from "next/link";
import { prisma } from "@/lib/db";
import ChatWidget from "@/components/ChatWidget";

export const dynamic = "force-dynamic";

const COURSES = [
  { title: "AI & Machine Learning", desc: "Python, LLMs, and applied ML for the workplace.", icon: "🤖" },
  { title: "Data Analytics", desc: "Power BI, SQL and data storytelling — WSQ funded.", icon: "📊" },
  { title: "Cybersecurity", desc: "Hands-on defensive security and ethical hacking.", icon: "🛡️" },
  { title: "Cloud & DevOps", desc: "AWS, Docker and CI/CD for modern teams.", icon: "☁️" },
  { title: "Web & Low-Code", desc: "Next.js, automation and rapid app building.", icon: "🌐" },
  { title: "Digital Marketing", desc: "SEO, social and AI-assisted content.", icon: "📈" },
];

export default async function Home() {
  const demoAvatar = await prisma.avatar.findFirst({
    where: { status: "READY" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="bg-white text-slate-800">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="font-bold">
            Tertiary<span className="text-brand">Training</span>
          </span>
          <nav className="flex items-center gap-4 text-sm">
            <a href="#courses" className="hover:text-brand">Courses</a>
            <a href="#why" className="hover:text-brand">Why us</a>
            <a href="#advisor" className="hover:text-brand">AI Advisor</a>
            <Link href="/login" className="rounded-lg bg-brand px-3 py-1.5 text-white hover:bg-brand-600">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-brand">
              Powered by MiniMax M3 + Speech 2.8
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Meet your <span className="text-brand">AI course educator</span> — live, lifelike, 24/7.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Talk to a digital human that answers questions about our WSQ &amp; professional training courses by voice —
              grounded in real course content, with lifelike lip-sync.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#advisor" className="rounded-xl bg-brand px-5 py-3 font-medium text-white hover:bg-brand-600">
                Talk to the advisor
              </a>
              <a href="#courses" className="rounded-xl border border-slate-300 px-5 py-3 font-medium hover:bg-slate-50">
                Browse courses
              </a>
            </div>
            <div className="mt-8 flex gap-8 text-sm text-slate-500">
              <div><span className="block text-2xl font-bold text-slate-900">40+</span>languages</div>
              <div><span className="block text-2xl font-bold text-slate-900">1M</span>token context</div>
              <div><span className="block text-2xl font-bold text-slate-900">24/7</span>availability</div>
            </div>
          </div>

          <div className="lg:pl-6">
            {demoAvatar ? (
              <ChatWidget
                avatarId={demoAvatar.id}
                name={demoAvatar.name}
                greeting={demoAvatar.greeting}
                portraitUrl={demoAvatar.portraitUrl ?? undefined}
                compact
              />
            ) : (
              <div className="grid h-[520px] place-items-center rounded-2xl bg-slate-50 text-center ring-1 ring-slate-200">
                <div className="px-6">
                  <p className="text-5xl">🧑‍🏫</p>
                  <p className="mt-4 font-medium">No avatar yet</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Sign in to the admin and create your first digital human.
                  </p>
                  <Link href="/login" className="mt-4 inline-block text-brand hover:underline">
                    Go to admin →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Popular training tracks</h2>
          <p className="mt-2 text-center text-slate-600">SkillsFuture &amp; WSQ-aligned. Ask the AI advisor for fees and schedules.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COURSES.map((c) => (
              <div key={c.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="text-3xl">{c.icon}</div>
                <h3 className="mt-3 font-semibold">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Why a digital human educator?</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { t: "Instant, human-like answers", d: "Voice-first guidance grounded in your real course catalogue — no waiting, no call centre." },
              { t: "Always consistent", d: "Every learner hears your approved messaging, in 40+ languages, around the clock." },
              { t: "Embed anywhere", d: "Drop one line of script onto any website and your advisor goes live instantly." },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl border border-slate-100 p-6">
                <h3 className="font-semibold text-brand">{f.t}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advisor CTA */}
      <section id="advisor" className="bg-gradient-to-br from-brand to-indigo-700 py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to find your course?</h2>
          <p className="mt-3 text-indigo-100">
            Ask our AI educator anything — course content, fees, funding, or schedules. It listens and talks back.
          </p>
          {demoAvatar && (
            <a
              href={`/chat/${demoAvatar.id}`}
              className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-medium text-brand hover:bg-indigo-50"
            >
              Open full-screen advisor ↗
            </a>
          )}
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Tertiary Infotech Academy Pte. Ltd. · Digital Human Educator</p>
        <p className="mt-1">
          Powered by{" "}
          <a
            href="https://www.tertiaryinfotech.com/"
            target="_blank"
            rel="noopener"
            className="text-brand hover:underline"
          >
            Tertiary Infotech Academy Pte Ltd
          </a>
        </p>
      </footer>
    </div>
  );
}
