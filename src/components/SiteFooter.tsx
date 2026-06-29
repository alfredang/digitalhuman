import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";

// Brand marks (Lucide dropped brand logos), kept as tiny inline SVGs.
const BrandIcon = {
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2.03c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.78-1.34-1.78-1.1-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.23 0 4.63-2.8 5.65-5.48 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5z" />
    </svg>
  ),
} as const;

// Network sites + contact details sourced from tertiaryinfotech.com.
const NETWORK = [
  { name: "Tertiary Infotech", href: "https://www.tertiaryinfotech.com" },
  { name: "Tertiary Courses", href: "https://www.tertiarycourses.com.sg" },
  { name: "Tertiary Workplace Learning", href: "https://workplacelearning.tertiaryinfotech.com" },
  { name: "Tertiary LMS / TMS", href: "https://lms-tms.tertiaryinfotech.com" },
  { name: "Tertiary Kids (AI4Kids)", href: "https://ai4kids.tertiarycourses.com.sg" },
  { name: "Tertiary PEI", href: "https://www.tertiaryinfotech.edu.sg" },
  { name: "Tertiary Exams", href: "https://exams.tertiaryinfotech.com" },
  { name: "Tertiary HRMS", href: "https://hrms.tertiaryinfotech.com" },
  { name: "SSG API Portal", href: "https://ssgapi.tertiaryinfotech.com" },
];

const COMPANY = [
  { name: "About Us", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
];

const SOCIAL = [
  { icon: BrandIcon.linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/angchewhoe" },
  { icon: BrandIcon.youtube, label: "YouTube", href: "https://www.youtube.com/@TertiaryCourses" },
  { icon: BrandIcon.github, label: "GitHub", href: "https://github.com/alfredang" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        {/* About */}
        <div>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tertiary-logo.png" alt="Tertiary Training" className="h-8 w-8" />
            <span className="text-lg font-bold text-white">
              Tertiary<span className="text-indigo-400">Training</span>
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Lifelike AI digital humans for 24/7 customer service, sales and presenting — by voice, in 40+ languages,
            embeddable on any website. A product of Tertiary Infotech Academy.
          </p>
          <div className="mt-4 flex gap-2">
            {SOCIAL.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-lg bg-slate-800 text-slate-300 transition hover:bg-indigo-600 hover:text-white"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {COMPANY.map((c) => (
              <li key={c.name}>
                <a href={c.href} className="text-slate-400 hover:text-white">{c.name}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Websites */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Our Websites</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {NETWORK.map((n) => (
              <li key={n.name}>
                <a href={n.href} target="_blank" rel="noopener" className="text-slate-400 hover:text-white">{n.name}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Contact</h4>
          <p className="mt-4 text-sm font-medium text-slate-300">Tertiary Infotech Academy Pte Ltd</p>
          <p className="text-xs text-slate-500">UEN: 201200606W</p>
          <ul className="mt-3 space-y-3 text-sm text-slate-400">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" strokeWidth={1.75} />
              <span>12 Woodlands Square #07-85/86/87<br />Woods Square Tower 1, Singapore 737715</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-indigo-400" strokeWidth={1.75} />
              <a href="tel:+6561000613" className="hover:text-white">+65 6100 0613</a>
            </li>
            <li className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 shrink-0 text-indigo-400" strokeWidth={1.75} />
              <a href="https://wa.me/6588666375" target="_blank" rel="noopener" className="hover:text-white">+65 8866 6375 (WhatsApp)</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-indigo-400" strokeWidth={1.75} />
              <a href="mailto:enquiry@tertiaryinfotech.com" className="hover:text-white">enquiry@tertiaryinfotech.com</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Tertiary Infotech Academy Pte Ltd. All rights reserved.</p>
        <p className="mt-1">
          Powered by{" "}
          <a href="https://www.tertiaryinfotech.com/" target="_blank" rel="noopener" className="text-indigo-400 hover:underline">
            Tertiary Infotech Academy Pte Ltd
          </a>
        </p>
      </div>
    </footer>
  );
}
