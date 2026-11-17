"use client";

import { Check, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Field, inputClass } from "@/components/ui";
import type { Locale } from "@/lib/i18n";
import { api } from "@/lib/utils";

const T = {
  fr: { thanks: "Merci, c'est noté.", back: (email: string) => `On revient vers toi à l'adresse ${email} très bientôt.`, name: "Ton nom", email: "E-mail", company: "Entreprise", product: "Outil qui t'intéresse", all: "Toute la suite", message: "Message", placeholder: "Ton équipe, tes besoins, tes questions…", sending: "Envoi…", send: "Envoyer la demande" },
  en: { thanks: "Thank you, we've got it.", back: (email: string) => `We'll get back to you at ${email} very soon.`, name: "Your name", email: "Email", company: "Company", product: "App you're interested in", all: "The whole suite", message: "Message", placeholder: "Your team, your needs, your questions…", sending: "Sending…", send: "Send the request" },
  de: { thanks: "Danke, ist notiert.", back: (email: string) => `Wir melden uns sehr bald unter ${email}.`, name: "Dein Name", email: "E-Mail", company: "Firma", product: "Welche App interessiert dich?", all: "Die ganze Suite", message: "Nachricht", placeholder: "Dein Team, deine Bedürfnisse, deine Fragen…", sending: "Wird gesendet…", send: "Anfrage senden" },
};

/** The request form of the public pages (`product` preselects an app). What is sent lands in the CRM as a prospect, with the language it was written in. */
export function ContactForm({ products, product = "", locale = "fr" }: { products: { id: string; name: string }[]; product?: string; locale?: Locale }) {
  const t = T[locale];
  const [form, setForm] = useState({ name: "", email: "", company: "", product, message: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // "Demander" on a product card picks that product here.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest<HTMLElement>("[data-product]");
      if (link?.dataset.product) setForm((f) => ({ ...f, product: link.dataset.product! }));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/contact", { method: "POST", json: { ...form, locale } });
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="rise flex flex-col items-start rounded-2xl border border-line bg-surface p-7 shadow-card">
        <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Check className="size-5" />
        </span>
        <h3 className="mt-5 font-display text-[30px] leading-none">{t.thanks}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{t.back(form.email)}</p>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.name}>
          <input required maxLength={120} autoComplete="name" value={form.name} onChange={set("name")} className={inputClass} />
        </Field>
        <Field label={t.email}>
          <input required type="email" maxLength={200} autoComplete="email" value={form.email} onChange={set("email")} className={inputClass} />
        </Field>
        <Field label={t.company}>
          <input maxLength={120} autoComplete="organization" value={form.company} onChange={set("company")} className={inputClass} />
        </Field>
        <Field label={t.product}>
          <select value={form.product} onChange={set("product")} className={inputClass}>
            <option value="">{t.all}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label={t.message}>
        <textarea maxLength={4000} rows={4} value={form.message} onChange={set("message")} placeholder={t.placeholder} className={`${inputClass} h-auto resize-y py-2.5 leading-relaxed`} />
      </Field>
      {/* Left empty by people, filled in by robots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden />
      {error && <p className="text-[13px] text-danger">{error}</p>}
      <Button variant="primary" className="h-11 self-start rounded-xl px-5 text-[14.5px]" disabled={busy}>
        <Send className="size-4" />
        {busy ? t.sending : t.send}
      </Button>
    </form>
  );
}
