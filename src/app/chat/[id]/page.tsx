import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import ChatWidget from "@/components/ChatWidget";

export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const avatar = await prisma.avatar.findUnique({ where: { id } });
  if (!avatar) notFound();

  // Honour the landing-page demo switch here too, so the "Chat with the avatar"
  // teaser doesn't spend API tokens while the demo is turned off.
  const demoEnabled = (await getSetting("DEMO_ENABLED")) === "true";

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-md">
        <ChatWidget
          avatarId={avatar.id}
          name={avatar.name}
          greeting={avatar.greeting}
          portraitUrl={avatar.portraitUrl ?? undefined}
          demoOff={!demoEnabled}
        />
      </div>
    </div>
  );
}
