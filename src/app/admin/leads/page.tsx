import { prisma } from "@/lib/db";
import LeadsTable from "./LeadsTable";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads</h1>
        <span className="text-sm text-slate-500">{leads.length} total</span>
      </div>
      <p className="mt-1 text-sm text-slate-500">Digital Human demo enquiries captured from the website.</p>
      <LeadsTable
        leads={leads.map((l) => ({
          id: l.id,
          name: l.name,
          email: l.email,
          company: l.company,
          phone: l.phone,
          interest: l.interest,
          status: l.status,
          createdAt: l.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
