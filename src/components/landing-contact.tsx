"use client";

import { Check, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Field, inputClass } from "@/components/ui";
import { api } from "@/lib/utils";

/** The request form of the public page. What is sent lands in the CRM as a prospect. */
export function ContactForm({ products }: { products: { id: string; name: string }[] }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", product: "", message: "", website: "" });
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
      await api("/api/contact", { method: "POST", json: form });
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
        <h3 className="mt-5 font-display text-[30px] leading-none">Merci, c&apos;est noté.</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-2">On revient vers toi à l&apos;adresse {form.email} très bientôt.</p>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ton nom">
          <input required maxLength={120} autoComplete="name" value={form.name} onChange={set("name")} className={inputClass} />
        </Field>
        <Field label="E-mail">
          <input required type="email" maxLength={200} autoComplete="email" value={form.email} onChange={set("email")} className={inputClass} />
        </Field>
        <Field label="Entreprise">
          <input maxLength={120} autoComplete="organization" value={form.company} onChange={set("company")} className={inputClass} />
        </Field>
        <Field label="Outil qui t'intéresse">
          <select value={form.product} onChange={set("product")} className={inputClass}>
            <option value="">Toute la suite</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Message">
        <textarea maxLength={4000} rows={4} value={form.message} onChange={set("message")} placeholder="Ton équipe, tes besoins, tes questions…" className={`${inputClass} h-auto resize-y py-2.5 leading-relaxed`} />
      </Field>
      {/* Left empty by people, filled in by robots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden />
      {error && <p className="text-[13px] text-danger">{error}</p>}
      <Button variant="primary" className="h-11 self-start rounded-xl px-5 text-[14.5px]" disabled={busy}>
        <Send className="size-4" />
        {busy ? "Envoi…" : "Envoyer la demande"}
      </Button>
    </form>
  );
}
