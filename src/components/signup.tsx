"use client";

import { ArrowRight, Lock, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { ProductIcon } from "@/components/product-icon";
import { Button, Field, inputClass } from "@/components/ui";
import { authClient, message } from "@/lib/auth-client";
import { money } from "@/lib/crm-labels";
import { MAX_SEATS, type Period, quote } from "@/lib/pricing";
import { api, cn, MIN_PASSWORD } from "@/lib/utils";

type Choice = {
  plan: { id: string; name: string; scope: string; monthly_cents: number | null; yearly_discount: number; trial_days: number };
  app: { id: string; name: string; color: string; price_cents: number | null } | null;
  period: Period;
  /** Free trial left for this account: false once the company already had licences. */
  trial: boolean;
  stripe: boolean;
};

/** The invitation link that opened the page: the account takes its address. */
export type Invitation = { token: string; email: string; name: string };

/**
 * Creates the account from the invitation (when nobody is signed in), then sends the browser to
 * the payment or starts the trial, or, without a formula, to the account to add a passkey.
 */
export function Signup({ choice, me, invitation }: { choice: Choice | null; me: { name: string; email: string } | null; invitation: Invitation | null }) {
  const [form, setForm] = useState({ name: invitation?.name ?? "", company: "", password: "", website: "" });
  const [seats, setSeats] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const q = choice ? quote(choice.plan, choice.app, seats, choice.period) : null;
  const trialDays = choice?.trial ? choice.plan.trial_days : 0;
  const creating = !me && !!invitation;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (creating && !signedIn) {
        // On a retry (sign-in or payment failed), the account already exists: it is not made twice.
        const email = created ?? (await api<{ email: string }>("/api/inscription", { method: "POST", json: { ...form, invitation: invitation.token } })).email;
        setCreated(email);
        const { error } = await authClient.signIn.email({ email, password: form.password });
        if (error) throw new Error(message(error));
        setSignedIn(true);
      }
      if (!choice) {
        window.location.href = "/compte?bienvenue=1";
        return;
      }
      const { url } = await api<{ url: string }>("/api/paiement", { method: "POST", json: { plan: choice.plan.id, product: choice.app?.id, seats, period: choice.period } });
      window.location.href = url;
    } catch (err) {
      setError((err as Error).message || "Une erreur est survenue.");
      setBusy(false);
    }
  };

  const action = !choice ? "Créer mon compte" : trialDays ? (choice.stripe ? `Commencer l'essai de ${trialDays} jours` : `Commencer l'essai gratuit`) : "Continuer vers le paiement";

  return (
    <form onSubmit={submit} className={cn("grid w-full gap-5", choice ? "lg:grid-cols-[1fr_380px]" : "mx-auto max-w-[560px]")}>
      <div className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <h1 className="font-display text-[38px] leading-none">{me ? "Ta formule" : "Crée ton compte"}</h1>
        <p className="text-[14px] text-ink-2">
          {me ? (
            <>Connecté en tant que <span className="font-medium text-ink">{me.email}</span>.</>
          ) : (
            "Tu as été invité. Un seul compte pour toutes les applications de la suite."
          )}
        </p>
        {creating && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ton nom">
                <input required maxLength={80} autoComplete="name" value={form.name} onChange={set("name")} className={inputClass} />
              </Field>
              <Field label="Entreprise ou équipe" hint="Facultatif">
                <input maxLength={120} autoComplete="organization" value={form.company} onChange={set("company")} className={inputClass} />
              </Field>
            </div>
            <Field label="E-mail" hint="L'adresse de ton invitation. Elle est déjà vérifiée.">
              <input readOnly type="email" autoComplete="email" value={invitation.email} className={cn(inputClass, "cursor-default text-ink-3")} />
            </Field>
            <Field label="Mot de passe" hint={`${MIN_PASSWORD} caractères au moins. Juste après, tu pourras aussi entrer avec Face ID, Touch ID ou Windows Hello.`}>
              <input required type="password" minLength={MIN_PASSWORD} autoComplete="new-password" value={form.password} onChange={set("password")} className={inputClass} />
            </Field>
            {/* Hidden to people: robots fill it in. */}
            <input tabIndex={-1} autoComplete="off" aria-hidden value={form.website} onChange={set("website")} className="absolute -left-[9999px] size-px opacity-0" name="website" />
          </>
        )}
        {choice && <Field label="Nombre de personnes">
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" aria-label="Une de moins" onClick={() => setSeats((s) => Math.max(1, s - 1))} disabled={seats <= 1}>
              <Minus className="size-4" />
            </Button>
            <input
              inputMode="numeric"
              value={seats}
              onChange={(e) => setSeats(Math.min(MAX_SEATS, Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1)))}
              className={cn(inputClass, "max-w-24 text-center tabular")}
              aria-label="Nombre de personnes"
            />
            <Button type="button" variant="secondary" size="sm" aria-label="Une de plus" onClick={() => setSeats((s) => Math.min(MAX_SEATS, s + 1))}>
              <Plus className="size-4" />
            </Button>
          </div>
        </Field>}
        {error && <p className="text-[13px] text-danger">{error}</p>}
        <Button variant="primary" className="h-11 w-full" disabled={busy || (creating && (!form.name.trim() || form.password.length < MIN_PASSWORD))}>
          {busy ? "Un instant…" : action}
          {!busy && <ArrowRight className="size-4" />}
        </Button>
        {!me && (
          <p className="text-center text-[12.5px] text-ink-3">
            Déjà un compte ? <a href={`/connexion`} className="font-medium text-ink hover:text-accent">Connecte-toi</a>, puis reviens sur cette page.
          </p>
        )}
      </div>

      {choice && <aside className="flex h-fit flex-col gap-4 rounded-3xl border border-line bg-[var(--glass-025)] p-6 sm:p-7">
        <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-3">Récapitulatif</p>
        <div className="flex items-center gap-3">
          {choice.app && <ProductIcon id={choice.app.id} color={choice.app.color || undefined} />}
          <div>
            <p className="font-display text-[28px] leading-none">{choice.app ? choice.app.name : choice.plan.name}</p>
            <p className="mt-1 text-[13px] text-ink-3">{choice.app ? choice.plan.name : "Toutes les applications"} · {choice.period === "annee" ? "à l'année" : "au mois"}</p>
          </div>
        </div>
        {q && (
          <dl className="flex flex-col gap-2 border-t border-line pt-4 text-[13.5px]">
            <div className="flex justify-between">
              <dt className="text-ink-3">Par personne et par mois</dt>
              <dd className="tabular">{money(q.unit)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-3">Personnes</dt>
              <dd className="tabular">{q.seats}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-[15px] font-medium">
              <dt>{choice.period === "annee" ? "Par an" : "Par mois"}</dt>
              <dd className="tabular">{money(q.charge)}</dd>
            </div>
          </dl>
        )}
        <p className="text-[12.5px] leading-relaxed text-ink-3">
          {trialDays
            ? choice.stripe
              ? `Rien n'est débité pendant ${trialDays} jours. Tu peux annuler avant depuis ton compte.`
              : `${trialDays} jours gratuits, sans carte. On te contacte avant la fin de l'essai.`
            : "Tu es débité aujourd'hui, puis à chaque renouvellement. Résiliable depuis ton compte."}
        </p>
        {choice.stripe && (
          <p className="flex items-center gap-1.5 text-[12px] text-ink-3">
            <Lock className="size-3.5" /> Paiement sécurisé par Stripe
          </p>
        )}
      </aside>}
    </form>
  );
}
