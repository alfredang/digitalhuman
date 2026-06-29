import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

// Enterprise B2B SaaS typeface (per UI/UX design system).
const sans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXTAUTH_URL || "https://www.tertiarytraining.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tertiary Training — 24/7 AI Avatar for Customer Service & Presenting",
    template: "%s · Tertiary Training",
  },
  description:
    "Lifelike AI digital humans for 24/7 customer service, sales and presenting — voice-enabled, multilingual (40+ languages), grounded in your content, and embeddable on any website. For education, retail, finance, healthcare and more.",
  keywords: [
    "AI digital human",
    "AI avatar",
    "virtual presenter",
    "AI customer service",
    "talking avatar",
    "lip sync avatar",
    "conversational AI",
    "voice AI agent",
    "digital human Singapore",
    "MiniMax",
  ],
  authors: [{ name: "Tertiary Infotech Academy Pte Ltd" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Tertiary Training",
    title: "24/7 AI Avatar for Customer Service & Presenting",
    description:
      "Lifelike, voice-enabled AI digital humans that talk, answer and present — embeddable on any website, in 40+ languages.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tertiary Training — AI Digital Humans",
    description: "24/7 AI avatars for customer service, sales and presenting. Voice-enabled, multilingual, embeddable.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tertiary Infotech Academy Pte Ltd",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  email: "enquiry@tertiaryinfotech.com",
  telephone: "+65-6100-0613",
  address: {
    "@type": "PostalAddress",
    streetAddress: "12 Woodlands Square #07-85/86/87 Woods Square Tower 1",
    postalCode: "737715",
    addressCountry: "SG",
  },
  makesOffer: {
    "@type": "Offer",
    itemOffered: {
      "@type": "SoftwareApplication",
      name: "Tertiary Training Digital Human",
      applicationCategory: "BusinessApplication",
      description:
        "24/7 AI avatar for customer service and presenting — voice-enabled, multilingual, embeddable digital humans.",
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </body>
    </html>
  );
}
