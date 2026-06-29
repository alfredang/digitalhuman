import { prisma } from "@/lib/db";
import { listPosts } from "@/lib/cms";
import BlogManager from "./BlogManager";

export const dynamic = "force-dynamic";

export default async function AdminBlog() {
  await listPosts(); // ensure samples seeded
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold">Blog</h1>
      <p className="mt-1 text-sm text-slate-500">Create and edit lead-magnet articles. Each post shows a demo enquiry form.</p>
      <BlogManager
        posts={posts.map((p) => ({
          slug: p.slug, title: p.title, excerpt: p.excerpt, content: p.content,
          industry: p.industry ?? "", coverImage: p.coverImage ?? "", published: p.published,
        }))}
      />
    </div>
  );
}
