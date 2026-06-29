import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ChatWidget from "@/components/ChatWidget";

export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const avatar = await prisma.avatar.findUnique({ where: { id } });
  if (!avatar) notFound();

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-md">
        <ChatWidget
          avatarId={avatar.id}
          name={avatar.name}
          greeting={avatar.greeting}
          portraitUrl={avatar.portraitUrl ?? undefined}
        />
      </div>
    </div>
  );
}
