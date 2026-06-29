import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import AvatarActions from "./AvatarActions";

export const dynamic = "force-dynamic";

export default async function AvatarDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const avatar = await prisma.avatar.findUnique({ where: { id }, include: { knowledge: true } });
  if (!avatar) notFound();

  return (
    <div>
      <Link href="/admin" className="text-sm text-brand hover:underline">
        ← All avatars
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[200px_1fr]">
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
            {avatar.portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar.portraitUrl} alt={avatar.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-slate-400">No portrait</div>
            )}
          </div>
          <span
            className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${
              avatar.status === "READY" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {avatar.status}
          </span>
          <p className="mt-1 text-xs text-slate-400">Voice: {avatar.voiceId ? "cloned ✓" : "default preset"}</p>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{avatar.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{avatar.greeting}</p>
          </div>

          <AvatarActions
            id={avatar.id}
            embedKey={avatar.embedKey}
            hasVoice={!!avatar.voiceId}
            voiceId={avatar.voiceId ?? ""}
            language={avatar.language}
          />

          <section>
            <h2 className="text-sm font-semibold text-slate-700">Persona</h2>
            <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{avatar.persona}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-700">Knowledge ({avatar.knowledge.length})</h2>
            <ul className="mt-1 space-y-1 text-sm text-slate-600">
              {avatar.knowledge.map((k) => (
                <li key={k.id} className="rounded bg-slate-50 px-3 py-1">
                  <span className="font-medium">{k.title}</span>
                </li>
              ))}
              {avatar.knowledge.length === 0 && <li className="text-slate-400">No knowledge documents.</li>}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
