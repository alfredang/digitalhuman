import { notFound } from "next/navigation";
import PageFrame from "@/components/PageFrame";
import LeadForm from "@/components/LeadForm";
import { getPage } from "@/lib/cms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const p = await getPage("contact");
  if (!p) notFound();
  return (
    <PageFrame title={p.title}>
      <div className="cms-content" dangerouslySetInnerHTML={{ __html: p.content }} />
      <div className="mt-8">
        <LeadForm />
      </div>
    </PageFrame>
  );
}
