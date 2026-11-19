"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, Field, inputClass } from "@/components/ui";
import { api } from "@/lib/utils";

/**
 * While accounts are made by invitation only: the visitor asks for access, the request lands in
 * the CRM as a prospect (with the formula picked on /tarifs), and an admin sends an invitation.
 */
export function RequestAccess({ wanted, product, expired }: { wanted: string | null; product: string | null; expired: boolean }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const note = [`Demande d'accès${wanted ? ` : ${wanted}` : ""}.`, form.message.trim()].filter(Boolean).join("\n\n");
      await api("/api/contact", { method: "POST", json: { ...form, message: note, product: product ?? undefined } });
      setSent(true);
    } catch (err) {
      setError((err as Error).message || "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  };

  if (sent)
    return (
      <div className="mx-auto max-w-[480px] rounded-3xl border border-line bg-surface p-8 text-center shadow-card">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Check className="size-5" />
        </span>
        <h1 className="mt-4 font-display text-[34px] leading-none">Demande envoyée.</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-2">On te répond vite, avec un lien d&apos;invitation envoyé à {form.email.trim()}.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-[520px] flex-col gap-4 rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <h1 className="font-display text-[38px] leading-none">Demander un accès</h1>
      <p className="text-[14px] leading-relaxed text-ink-2">
        {expired ? "Ce lien d'invitation n'est plus valable : il a déjà servi, a expiré ou a été retiré. " : ""}
        Pour l&apos;instant, les comptes s&apos;ouvrent sur invitation. Laisse-nous ton adresse{wanted ? <> pour <span className="font-medium text-ink">{wanted}</span></> : ""} : on t&apos;envoie un lien pour créer ton compte.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ton nom">
          <input required maxLength={120} autoComplete="name" value={form.name} onChange={set("name")} className={inputClass} />
        </Field>
        <Field label="Entreprise ou équipe" hint="Facultatif">
          <input maxLength={120} autoComplete="organization" value={form.company} onChange={set("company")} className={inputClass} />
        </Field>
      </div>
      <Field label="E-mail">
        <input required type="email" maxLength={200} autoComplete="email" value={form.email} onChange={set("email")} className={inputClass} />
      </Field>
      <Field label="Un mot sur ton équipe" hint="Facultatif">
        <textarea rows={3} maxLength={2000} value={form.message} onChange={set("message")} className={`${inputClass} h-auto resize-y py-2.5 leading-relaxed`} />
      </Field>
      {/* Hidden to people: robots fill it in. */}
      <input tabIndex={-1} autoComplete="off" aria-hidden value={form.website} onChange={set("website")} className="absolute -left-[9999px] size-px opacity-0" name="website" />
      {error && <p className="text-[13px] text-danger">{error}</p>}
      <Button variant="primary" className="h-11 w-full" disabled={busy || !form.name.trim() || !form.email}>
        {busy ? "Un instant…" : "Demander un accès"}
        {!busy && <ArrowRight className="size-4" />}
      </Button>
      <p className="text-center text-[12.5px] text-ink-3">
        Déjà un compte ? <Link href="/connexion" className="font-medium text-ink hover:text-accent">Connecte-toi</Link>, puis reviens sur cette page.
      </p>
    </form>
  );
}
