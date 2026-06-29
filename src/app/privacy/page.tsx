import { notFound } from "next/navigation";
import PageFrame from "@/components/PageFrame";
import { getPage } from "@/lib/cms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const p = await getPage("privacy");
  if (!p) notFound();
  return (
    <PageFrame title={p.title}>
      <div className="cms-content" dangerouslySetInnerHTML={{ __html: p.content }} />
    </PageFrame>
  );
}
