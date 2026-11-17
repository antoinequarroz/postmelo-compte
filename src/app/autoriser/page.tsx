"use client";

import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui";
import { authClient, message } from "@/lib/auth-client";

/**
 * "Allow this app?" The tools of the suite skip this page (they are first-party).
 * It only shows for a request that asks for consent on purpose (prompt=consent).
 */
export default function ConsentPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const answer = async (accept: boolean) => {
    setBusy(true);
    const { error } = await authClient.oauth2.consent({ accept });
    if (error) {
      setError(message(error));
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="rise w-full max-w-[380px] rounded-2xl border border-line bg-surface/80 p-7 shadow-card backdrop-blur-xl">
        <Logo className="size-9" />
        <h1 className="mt-5 font-display text-[30px] leading-none">Autoriser l&apos;accès</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">Un outil de la suite demande à connaître ton nom, ton e-mail et ton rôle pour t&apos;ouvrir une session.</p>
        {error && <p className="mt-2 text-[12.5px] text-danger">{error}</p>}
        <div className="mt-5 flex gap-2">
          <Button variant="primary" disabled={busy} onClick={() => answer(true)}>
            Autoriser
          </Button>
          <Button disabled={busy} onClick={() => answer(false)}>
            Refuser
          </Button>
        </div>
      </div>
    </div>
  );
}
