import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const avatars = await prisma.avatar.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Avatars</h1>
        <Link
          href="/admin/avatars/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          + New avatar
        </Link>
      </div>

      {avatars.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500">No avatars yet.</p>
          <Link href="/admin/avatars/new" className="mt-3 inline-block text-brand hover:underline">
            Create your first digital human →
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {avatars.map((a) => (
            <Link
              key={a.id}
              href={`/admin/avatars/${a.id}`}
              className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                {a.portraitUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.portraitUrl} alt={a.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-slate-400">No portrait</div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-medium">{a.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    a.status === "READY" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {a.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
