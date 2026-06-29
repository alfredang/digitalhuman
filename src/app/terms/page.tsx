import { notFound } from "next/navigation";
import PageFrame from "@/components/PageFrame";
import { getPage } from "@/lib/cms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Terms of Service" };

export default async function TermsPage() {
  const p = await getPage("terms");
  if (!p) notFound();
  return (
    <PageFrame title={p.title}>
      <div className="cms-content" dangerouslySetInnerHTML={{ __html: p.content }} />
    </PageFrame>
  );
}
