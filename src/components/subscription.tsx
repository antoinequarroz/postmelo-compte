"use client";

import { ArrowUpRight, PartyPopper } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Title } from "@/components/account";
import { Button, Card } from "@/components/ui";
import { day, LICENSE_STATUS_LABEL, money } from "@/lib/crm-labels";
import { api, cn } from "@/lib/utils";

type Props = {
  company: string;
  portal: boolean;
  licences: { product: string; status: string; seats: number; renewal: string | null; price_cents: number }[];
  /** Just back from Stripe, or the free trial just started. */
  welcome: "abonnement" | "essai" | null;
};

/** "Mon abonnement" on the account page: the licences of the company, and the Stripe page for invoices and the card. */
export function Subscription({ company, portal, licences, welcome }: Props) {
  const [busy, setBusy] = useState(false);
  const open = async () => {
    setBusy(true);
    try {
      const { url } = await api<{ url: string }>("/api/paiement/portail", { method: "POST" });
      window.location.href = url;
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(false);
    }
  };
  const total = licences.filter((l) => l.status === "actif" || l.status === "essai").reduce((s, l) => s + l.price_cents, 0);
  return (
    <Card className="flex flex-col gap-3">
      {welcome && (
        <p className="flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-[13px] text-accent">
          <PartyPopper className="size-4" />
          {welcome === "essai" ? "Ton essai gratuit a commencé : tes applications sont ouvertes à ton compte." : "Merci ! Ton abonnement est enregistré. Les applications s'ouvrent dans quelques secondes."}
        </p>
      )}
      <Title hint={licences.length ? `Les licences de ${company}.` : "Aucune licence pour l'instant."}>Mon abonnement</Title>
      {licences.length > 0 && (
        <ul className="divide-y divide-line rounded-lg border border-line text-[13px]">
          {licences.map((l) => (
            <li key={l.product} className="flex items-center gap-3 px-3 py-2">
              <span className="font-medium">{l.product}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[11.5px]", l.status === "actif" ? "bg-ok/12 text-ok" : l.status === "essai" ? "bg-warn/14 text-warn" : "bg-danger/12 text-danger")}>{LICENSE_STATUS_LABEL[l.status]}</span>
              <span className="ml-auto text-ink-3">
                {l.seats} place{l.seats > 1 ? "s" : ""}
                {l.renewal ? ` · ${l.status === "essai" ? "fin de l'essai" : "renouvellement"} le ${day(l.renewal)}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {total > 0 && <span className="text-[13px] text-ink-3">Environ <span className="font-medium text-ink">{money(total)}</span> par mois</span>}
        <span className="ml-auto" />
        <a href="/tarifs" className="inline-flex h-8 items-center rounded-lg px-2.5 text-[13px] text-ink-2 hover:bg-ink/5 hover:text-ink">Voir les formules</a>
        {portal && (
          <Button size="sm" onClick={open} disabled={busy}>
            Factures et paiement <ArrowUpRight className="size-3.5" />
          </Button>
        )}
      </div>
    </Card>
  );
}
