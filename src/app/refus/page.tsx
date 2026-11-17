import Link from "next/link";
import { Logo } from "@/components/logo";
import { primaryClass } from "@/lib/styles";
import { tool } from "@/server/tools";

export const dynamic = "force-dynamic";

/** Shown when a member tries to enter a tool an admin has not opened to them. */
export default async function RefusalPage({ searchParams }: { searchParams: Promise<{ outil?: string }> }) {
  const asked = tool((await searchParams).outil);
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="rise w-full max-w-[380px] rounded-2xl border border-line bg-surface/80 p-7 shadow-card backdrop-blur-xl">
        <Logo className="size-9" />
        <h1 className="mt-5 font-display text-[30px] leading-none">Accès non ouvert</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">
          {asked ? `${asked.name} n'est pas ouvert à ton compte.` : "Cet outil n'est pas ouvert à ton compte."} Demande à un administrateur de te l&apos;ouvrir, puis réessaie.
        </p>
        <Link href="/compte" className={`press mt-5 inline-flex h-9 items-center rounded-lg px-3.5 text-[13.5px] font-medium ${primaryClass}`}>
          Voir mon compte
        </Link>
      </div>
    </div>
  );
}
