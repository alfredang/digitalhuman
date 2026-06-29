import Link from "next/link";

// Network sites + contact details sourced from tertiaryinfotech.com.
const NETWORK = [
  { name: "Tertiary Infotech", href: "https://www.tertiaryinfotech.com" },
  { name: "Tertiary Courses", href: "https://www.tertiarycourses.com.sg" },
  { name: "Tertiary Workplace Learning", href: "https://www.tertiaryinfotech.com" },
  { name: "Tertiary LMS / TMS", href: "https://www.tertiaryinfotech.com" },
  { name: "Tertiary Kids", href: "https://www.tertiaryinfotech.com" },
  { name: "Tertiary IoT", href: "https://www.tertiaryinfotech.com" },
  { name: "SSG API Portal", href: "https://www.tertiaryinfotech.com" },
];

const COMPANY = [
  { name: "About Us", href: "https://www.tertiaryinfotech.com" },
  { name: "Blog", href: "https://www.tertiaryinfotech.com/blog" },
  { name: "Contact", href: "https://www.tertiaryinfotech.com/contact" },
  { name: "Privacy Policy", href: "https://www.tertiaryinfotech.com" },
  { name: "Terms of Service", href: "https://www.tertiaryinfotech.com" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* About */}
        <div>
          <span className="text-lg font-bold text-white">
            Tertiary<span className="text-indigo-400">Training</span>
          </span>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Lifelike AI digital humans for 24/7 customer service, sales and presenting — by voice, in 40+ languages,
            embeddable on any website. A product of Tertiary Infotech Academy.
          </p>
          <div className="mt-4 flex gap-3 text-slate-400">
            <a href="https://www.linkedin.com/in/angchewhoe" target="_blank" rel="noopener" className="hover:text-white">LinkedIn</a>
            <a href="https://www.youtube.com/@TertiaryCourses" target="_blank" rel="noopener" className="hover:text-white">YouTube</a>
            <a href="https://github.com/alfredang" target="_blank" rel="noopener" className="hover:text-white">GitHub</a>
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {COMPANY.map((c) => (
              <li key={c.name}>
                <a href={c.href} target="_blank" rel="noopener" className="text-slate-400 hover:text-white">{c.name}</a>
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
          <address className="mt-4 space-y-2 text-sm not-italic text-slate-400">
            <p className="font-medium text-slate-300">Tertiary Infotech Academy Pte Ltd</p>
            <p>UEN: 201200606W</p>
            <p>12 Woodlands Square #07-85/86/87<br />Woods Square Tower 1, Singapore 737715</p>
            <p>
              Tel: <a href="tel:+6561000613" className="hover:text-white">+65 6100 0613</a><br />
              WhatsApp: <a href="https://wa.me/6588666375" target="_blank" rel="noopener" className="hover:text-white">+65 8866 6375</a><br />
              <a href="mailto:enquiry@tertiaryinfotech.com" className="hover:text-white">enquiry@tertiaryinfotech.com</a>
            </p>
          </address>
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
