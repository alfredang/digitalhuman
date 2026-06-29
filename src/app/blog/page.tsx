import Link from "next/link";
import PageFrame from "@/components/PageFrame";
import { listPosts } from "@/lib/cms";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Blog — Digital Humans across Industries",
  description: "Insights on using AI digital humans for customer service, sales and presenting in education, retail, finance, healthcare and hospitality.",
};

export default async function BlogPage() {
  const posts = await listPosts();
  return (
    <PageFrame title="Blog" intro="How AI digital humans are transforming customer service, sales and presenting — by industry.">
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            {p.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.coverImage} alt={p.title} className="h-40 w-full object-cover" />
            )}
            <div className="p-5">
              {p.industry && (
                <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-brand">{p.industry}</span>
              )}
              <h2 className="mt-2 font-bold text-slate-900 group-hover:text-brand">{p.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{p.excerpt}</p>
              <span className="mt-3 inline-block text-sm font-medium text-brand">Read more →</span>
            </div>
          </Link>
        ))}
      </div>
    </PageFrame>
  );
}
