import Link from "next/link";
import SiteFooter from "./SiteFooter";

export default function PageFrame({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tertiary-logo.png" alt="Tertiary Training" className="h-8 w-8" />
            <span className="font-bold">Tertiary<span className="text-brand">Training</span></span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="hidden hover:text-brand sm:inline">Home</Link>
            <Link href="/contact" className="hidden hover:text-brand sm:inline">Contact</Link>
            <Link href="/#enquire" className="rounded-lg bg-brand px-3 py-1.5 font-medium text-white hover:bg-brand-600">
              Book a demo
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        {intro && <p className="mt-3 text-lg text-slate-600">{intro}</p>}
        <div className="mt-8">{children}</div>
      </main>

      <SiteFooter />
    </div>
  );
}
