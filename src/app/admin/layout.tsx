import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin, signOut } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login?callbackUrl=/admin");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-slate-900">
              Digital Human <span className="text-brand">Admin</span>
            </Link>
            <nav className="flex gap-4 text-sm text-slate-600">
              <Link href="/admin" className="hover:text-brand">
                Avatars
              </Link>
              <Link href="/admin/avatars/new" className="hover:text-brand">
                New avatar
              </Link>
              <Link href="/admin/settings" className="hover:text-brand">
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">{admin.email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
