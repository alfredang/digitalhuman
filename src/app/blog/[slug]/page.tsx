import Link from "next/link";
import { notFound } from "next/navigation";
import PageFrame from "@/components/PageFrame";
import LeadForm from "@/components/LeadForm";
import { getPost } from "@/lib/cms";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPost(slug);
  return p ? { title: p.title, description: p.excerpt } : { title: "Article" };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p || !p.published) notFound();

  return (
    <PageFrame title={p.title} intro={p.excerpt}>
      {p.industry && (
        <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-brand">{p.industry}</span>
      )}
      {p.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.coverImage} alt={p.title} className="mt-4 w-full rounded-2xl object-cover" />
      )}
      <div className="cms-content mt-6" dangerouslySetInnerHTML={{ __html: p.content }} />

      {/* Lead-magnet CTA — every post drives a demo enquiry */}
      <div className="mt-10 rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <h2 className="text-xl font-bold text-white">Want a digital human for your {p.industry || "business"}?</h2>
        <p className="mt-2 text-sm text-indigo-100">
          We build, host and deliver it — your branded avatar, cloned voice and knowledge base, with a one-line embed.
          Book a free, tailored demo below.
        </p>
        <div className="mt-5">
          <LeadForm />
        </div>
      </div>

      <p className="mt-8 text-sm">
        <Link href="/blog" className="text-brand hover:underline">← Back to all articles</Link>
      </p>
    </PageFrame>
  );
}
