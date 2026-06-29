import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ChatWidget from "@/components/ChatWidget";

export const dynamic = "force-dynamic";

// Minimal, chrome-less page intended to be loaded inside an iframe via embed.js.
export default async function EmbedPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const avatar = await prisma.avatar.findUnique({ where: { embedKey: key } });
  if (!avatar) notFound();

  return (
    <div className="h-screen w-screen bg-transparent">
      <ChatWidget
        avatarId={avatar.id}
        name={avatar.name}
        greeting={avatar.greeting}
        portraitUrl={avatar.portraitUrl ?? undefined}
        compact
      />
    </div>
  );
}
