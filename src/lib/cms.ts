import { prisma } from "./db";

// ---------- Default editable pages ----------
export const DEFAULT_PAGES: { slug: string; title: string; content: string }[] = [
  {
    slug: "about",
    title: "About Us",
    content: `
      <p>Tertiary Training is the digital-human service from <strong>Tertiary Infotech Academy Pte Ltd</strong> (UEN 201200696W), a Singapore-based technology and training company.</p>
      <p>We build, host and deliver lifelike AI digital humans for businesses — voice-enabled avatars that handle customer service, sales and presenting on your website, 24/7, in 40+ languages.</p>
      <h2>What we do</h2>
      <p>It's a fully managed, done-for-you service. We create your branded avatar, clone your brand voice, train it on your own content (RAG), and hand you a one-line embed snippet for any website. You focus on your customers; we handle the AI, hosting and updates.</p>
      <h2>Why a digital human</h2>
      <ul>
        <li>Instant, human-like answers — no waiting, no call centre</li>
        <li>Consistent, on-brand messaging in every language</li>
        <li>Always on, infinitely scalable, and embeddable anywhere</li>
      </ul>
      <p>Ready to see it for your business? <a href="/#enquire">Book a free demo</a>.</p>`,
  },
  {
    slug: "contact",
    title: "Contact Us",
    content: `
      <p>We'd love to show you a digital human tailored to your industry. Reach us through any channel below, or use the demo request form on this page.</p>
      <h2>Tertiary Infotech Academy Pte Ltd</h2>
      <ul>
        <li>Address: 12 Woodlands Square #07-85/86/87 Woods Square Tower 1, Singapore 737715</li>
        <li>Phone: <a href="tel:+6561000613">+65 6100 0613</a></li>
        <li>WhatsApp: <a href="https://wa.me/6588666375">+65 8866 6375</a></li>
        <li>Email: <a href="mailto:enquiry@tertiaryinfotech.com">enquiry@tertiaryinfotech.com</a></li>
        <li>UEN: 201200696W</li>
      </ul>`,
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    content: `
      <p>This Privacy Policy explains how Tertiary Infotech Academy Pte Ltd ("we", "us") collects and uses personal data through this website.</p>
      <h2>Information we collect</h2>
      <p>When you submit a demo enquiry we collect the details you provide (name, email, company, phone and your message). When you chat with a demo avatar, the conversation may be processed by our AI providers to generate responses.</p>
      <h2>How we use it</h2>
      <ul>
        <li>To respond to your enquiry and arrange a demo</li>
        <li>To improve our service and website</li>
      </ul>
      <h2>Data retention &amp; your rights</h2>
      <p>We retain enquiry data only as long as needed for the purposes above. To access, correct or delete your data, contact <a href="mailto:enquiry@tertiaryinfotech.com">enquiry@tertiaryinfotech.com</a>.</p>`,
  },
  {
    slug: "terms",
    title: "Terms of Service",
    content: `
      <p>By using this website you agree to these terms.</p>
      <h2>Use of the service</h2>
      <p>The demo avatar and content are provided "as is" for evaluation. AI-generated responses may be inaccurate and should not be relied upon as professional advice.</p>
      <h2>Intellectual property</h2>
      <p>All trademarks, content and software are owned by Tertiary Infotech Academy Pte Ltd unless stated otherwise.</p>
      <h2>Contact</h2>
      <p>Questions about these terms? Email <a href="mailto:enquiry@tertiaryinfotech.com">enquiry@tertiaryinfotech.com</a>.</p>`,
  },
];

// ---------- Sample blog posts (lead magnets) ----------
function post(slug: string, title: string, industry: string, excerpt: string, cover: string, body: string) {
  return { slug, title, industry, excerpt, coverImage: cover, content: body, published: true };
}

export const SAMPLE_POSTS = [
  post(
    "ai-digital-humans-in-education",
    "How AI Digital Humans Are Transforming Education",
    "Education",
    "From 24/7 course advisors to multilingual tutors, digital humans are reshaping how institutions support learners.",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200",
    `<p>Education providers field the same questions thousands of times — course fees, schedules, eligibility, funding. An AI digital human answers all of them instantly, 24/7, in any language.</p>
     <h2>Use cases that work today</h2>
     <ul>
       <li><strong>Course advisor:</strong> grounded in your real catalogue, it recommends programmes and explains subsidies.</li>
       <li><strong>Onboarding:</strong> walks new students through enrolment and orientation.</li>
       <li><strong>Tutoring support:</strong> answers FAQs and points learners to the right resources.</li>
     </ul>
     <h2>Why it converts</h2>
     <p>Prospective students get answers the moment their interest peaks — no waiting for office hours. Institutions capture more qualified leads and cut repetitive support load.</p>`,
  ),
  post(
    "ai-avatars-for-retail-ecommerce",
    "Virtual Shopping Assistants: Digital Humans in Retail & E-commerce",
    "Retail",
    "Lifelike avatars that recommend products, answer questions and lift conversion on your storefront.",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200",
    `<p>Online shoppers abandon carts when they can't get a quick answer. A digital human shopping assistant closes that gap with face-to-face, voice-enabled guidance.</p>
     <h2>What it does</h2>
     <ul>
       <li>Recommends products based on the shopper's needs</li>
       <li>Answers sizing, shipping and returns questions instantly</li>
       <li>Upsells and cross-sells naturally in conversation</li>
     </ul>
     <p>Embedded on product pages, it behaves like your best in-store associate — at internet scale.</p>`,
  ),
  post(
    "digital-humans-in-finance-banking",
    "Digital Humans in Finance & Banking: Trust at Scale",
    "Finance",
    "Explain products, pre-qualify leads and guide customers through applications — compliantly and 24/7.",
    "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=1200",
    `<p>Financial products are complex, and customers want guidance before they commit. A digital human explains options clearly, in plain language, any time of day.</p>
     <h2>High-value applications</h2>
     <ul>
       <li>Explaining loan, insurance and investment products</li>
       <li>Pre-qualifying and routing leads to human advisors</li>
       <li>Guiding customers through onboarding and KYC steps</li>
     </ul>
     <p>Grounded only in your approved content, the avatar stays on-message and consistent.</p>`,
  ),
  post(
    "digital-humans-in-healthcare",
    "Digital Humans in Healthcare: Better Access, Less Admin",
    "Healthcare",
    "Appointment guidance, patient FAQs and multilingual pre-visit triage that frees up your front desk.",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200",
    `<p>Clinics and hospitals are overwhelmed with routine enquiries. A digital human handles the repetitive questions so staff can focus on care.</p>
     <h2>Where it helps</h2>
     <ul>
       <li>Appointment and directions guidance</li>
       <li>Answering common patient FAQs in their language</li>
       <li>Pre-visit information and preparation steps</li>
     </ul>
     <p>Accessible and patient-friendly, it improves experience while reducing admin load.</p>`,
  ),
  post(
    "digital-humans-in-hospitality-travel",
    "Concierge Avatars: Digital Humans in Hospitality & Travel",
    "Hospitality",
    "24/7 multilingual concierge service for bookings, local tips and guest support — on your site and in-property.",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
    `<p>Travellers expect instant, personal service in their own language. A digital human concierge delivers it around the clock.</p>
     <h2>Guest-facing use cases</h2>
     <ul>
       <li>Handling bookings and answering availability questions</li>
       <li>Recommending local attractions and dining</li>
       <li>Resolving common requests without the front desk queue</li>
     </ul>
     <p>Embed it on your booking site or run it on a lobby kiosk — same avatar, everywhere.</p>`,
  ),
];

// ---------- Lazy seeding (fresh prod DB) ----------
async function ensurePages() {
  if ((await prisma.page.count()) > 0) return;
  await prisma.page.createMany({ data: DEFAULT_PAGES });
}
async function ensurePosts() {
  if ((await prisma.post.count()) > 0) return;
  await prisma.post.createMany({ data: SAMPLE_POSTS });
}

export async function getPage(slug: string) {
  await ensurePages();
  return prisma.page.findUnique({ where: { slug } });
}
export async function listPages() {
  await ensurePages();
  return prisma.page.findMany({ orderBy: { slug: "asc" } });
}
export async function listPosts() {
  await ensurePosts();
  return prisma.post.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });
}
export async function getPost(slug: string) {
  await ensurePosts();
  return prisma.post.findUnique({ where: { slug } });
}
