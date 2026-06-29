import { listPages } from "@/lib/cms";
import PagesEditor from "./PagesEditor";

export const dynamic = "force-dynamic";

export default async function AdminPages() {
  const pages = await listPages();
  return (
    <div>
      <h1 className="text-2xl font-bold">Pages</h1>
      <p className="mt-1 text-sm text-slate-500">Edit the content of your public pages (HTML supported).</p>
      <PagesEditor pages={pages.map((p) => ({ slug: p.slug, title: p.title, content: p.content }))} />
    </div>
  );
}
