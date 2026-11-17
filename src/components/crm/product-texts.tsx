"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Field, inputClass, Modal } from "@/components/ui";
import { LOCALE_NAME } from "@/lib/i18n";
import { api, cn } from "@/lib/utils";
import type { Product } from "@/server/crm";
import type { ProductText } from "@/server/content";

const OTHER = ["en", "de"] as const;
type Other = (typeof OTHER)[number];
type Texts = { category: string; tagline: string; description: string };

/** The English and German texts of a product, shown on /en and /de. Empty fields fall back to French. */
export function ProductTranslations({ product, texts }: { product: Product; texts: ProductText[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Other>("en");
  const initial = () =>
    Object.fromEntries(OTHER.map((l) => [l, { category: "", tagline: "", description: "", ...texts.find((t) => t.locale === l) }])) as Record<Other, Texts>;
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const done = OTHER.filter((l) => texts.some((t) => t.locale === l && t.tagline));
  const v = values[tab];
  const set = (k: keyof Texts) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((all) => ({ ...all, [tab]: { ...all[tab], [k]: e.target.value } }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      for (const l of OTHER) {
        const { category, tagline, description } = values[l];
        await api(`/api/site/produits/${product.id}/${l}`, { method: "PUT", json: { category, tagline, description } });
      }
      toast("Traductions enregistrées");
      router.refresh();
      setOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setValues(initial());
          setOpen(true);
        }}
        title="Textes en anglais et en allemand"
      >
        <Languages className="size-3.5" /> {done.length === OTHER.length ? "EN · DE" : done.length ? `${done.map((l) => l.toUpperCase()).join(" · ")} · à compléter` : "Traduire"}
      </Button>
      {open && (
        <Modal title={`${product.name} · traductions`} onClose={() => setOpen(false)} wide>
          <form onSubmit={save} className="flex flex-col gap-3">
            <div className="flex rounded-lg border border-line-strong bg-surface p-0.5">
              {OTHER.map((l) => (
                <button key={l} type="button" onClick={() => setTab(l)} className={cn("press h-8 flex-1 rounded-md text-[13px] font-medium", tab === l ? "bg-accent-soft text-accent" : "text-ink-2 hover:text-ink")}>
                  {LOCALE_NAME[l]}
                </button>
              ))}
            </div>
            <Field label="Catégorie" hint={`En français : ${product.category || "—"}`}>
              <input value={v.category} onChange={set("category")} className={inputClass} />
            </Field>
            <Field label="Accroche" hint={`En français : ${product.tagline || "—"}`}>
              <input value={v.tagline} onChange={set("tagline")} className={inputClass} />
            </Field>
            <Field label="Points forts (un par ligne)">
              <textarea rows={5} value={v.description} onChange={set("description")} placeholder={product.description} className={`${inputClass} h-auto resize-y py-2 leading-relaxed`} />
            </Field>
            <p className="text-[11.5px] text-ink-3">Un champ laissé vide affiche le texte français sur la version {tab === "en" ? "anglaise" : "allemande"} du site.</p>
            <div className="mt-1 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button variant="primary" disabled={busy}>
                Enregistrer
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
