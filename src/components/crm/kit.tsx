"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, Field, inputClass, Modal } from "@/components/ui";
import { fromCents, toCents, type Tone } from "@/lib/crm-labels";
import { api, cn } from "@/lib/utils";

// ---- Small pieces of the CRM pages

const TONES: Record<Tone, string> = {
  ok: "bg-ok/12 text-ok",
  warn: "bg-warn/14 text-warn",
  danger: "bg-danger/12 text-danger",
  accent: "bg-accent-soft text-accent",
  neutral: "bg-ink/6 text-ink-2",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex h-[22px] items-center whitespace-nowrap rounded-full px-2 text-[11.5px] font-medium", TONES[tone], className)}>{children}</span>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-[13px] text-ink-3">{children}</p>;
}

export const selectClass = "h-8 rounded-lg border border-line-strong bg-surface px-2 text-[12.5px] outline-none focus:border-accent/60";

// ---- Talking to the CRM API: every change refreshes the page's data

export function useCrm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const run = async (method: string, url: string, json: unknown, done?: string) => {
    setBusy(true);
    try {
      const res = await api<{ ok: true; id?: string }>(url, { method, json });
      router.refresh();
      if (done) toast(done);
      return res;
    } catch (e) {
      toast.error((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  };
  return {
    busy,
    create: (kind: string, data: Record<string, unknown>, done?: string) => run("POST", `/api/crm/${kind}`, data, done),
    update: (kind: string, id: string, data: Record<string, unknown>, done?: string) => run("PATCH", `/api/crm/${kind}/${id}`, data, done),
    remove: (kind: string, id: string, done?: string) => run("DELETE", `/api/crm/${kind}/${id}`, {}, done),
  };
}

/** Deletes on the second click: the first one asks, without a browser dialog. */
export function DeleteButton({ onConfirm, label = "Supprimer", compact }: { onConfirm: () => void; label?: string; compact?: boolean }) {
  const [asking, setAsking] = useState(false);
  useEffect(() => {
    if (!asking) return;
    const t = setTimeout(() => setAsking(false), 3500);
    return () => clearTimeout(t);
  }, [asking]);
  return (
    <Button
      type="button"
      variant={asking ? "danger" : "ghost"}
      size="sm"
      aria-label={label}
      title={label}
      onClick={() => (asking ? (setAsking(false), onConfirm()) : setAsking(true))}
    >
      <Trash2 className="size-3.5" />
      {(asking || !compact) && <span>{asking ? "Confirmer" : label}</span>}
    </Button>
  );
}

// ---- One form for every kind of record

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "email" | "url" | "textarea" | "select" | "money" | "int" | "date" | "image";
  options?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  placeholder?: string;
  half?: boolean;
  /** For "money": an empty field is sent as null ("sur demande") instead of 0. */
  nullable?: boolean;
};

type Values = Record<string, string>;

function initialValues(fields: FieldDef[], record?: Record<string, unknown>): Values {
  const v: Values = {};
  for (const f of fields) {
    const raw = record?.[f.key];
    if (f.type === "money") v[f.key] = typeof raw === "number" ? fromCents(raw) : "";
    else v[f.key] = raw == null ? (f.type === "select" ? (f.options?.[0]?.value ?? "") : "") : String(raw);
  }
  return v;
}

/** Turns the form's strings into what the API expects, or returns an error message. */
function toPayload(fields: FieldDef[], values: Values): Record<string, unknown> | string {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = values[f.key]?.trim() ?? "";
    if (f.type === "money") {
      const cents = toCents(v);
      if (Number.isNaN(cents)) return `${f.label} : montant invalide.`;
      out[f.key] = cents ?? (f.nullable ? null : 0);
    } else if (f.type === "int") out[f.key] = v === "" ? undefined : Number(v);
    else if (f.type === "date") out[f.key] = v || null;
    else out[f.key] = v;
  }
  return out;
}

export function RecordModal({
  title,
  fields,
  record,
  fixed,
  submit,
  onClose,
  onSave,
}: {
  title: string;
  fields: FieldDef[];
  record?: Record<string, unknown>;
  /** Values sent with the form but not shown (the client of a contact, for instance). */
  fixed?: Record<string, unknown>;
  submit: string;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<unknown>;
}) {
  const [values, setValues] = useState(() => initialValues(fields, record));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = toPayload(fields, values);
    if (typeof payload === "string") return setError(payload);
    setBusy(true);
    const ok = await onSave({ ...payload, ...fixed });
    setBusy(false);
    if (ok) onClose();
  };
  return (
    <Modal title={title} onClose={onClose} wide={fields.length > 4}>
      <form onSubmit={save} className="grid grid-cols-2 gap-3">
        {fields.map((f) => {
          const common = {
            id: `f-${f.key}`,
            value: values[f.key],
            required: f.required,
            placeholder: f.placeholder,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [f.key]: e.target.value })),
          };
          return (
            <div key={f.key} className={f.half ? "col-span-1 max-sm:col-span-2" : "col-span-2"}>
              <Field label={f.label} hint={f.hint}>
                {f.type === "image" ? (
                  <ImageInput value={values[f.key]} onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))} onError={setError} />
                ) : f.type === "textarea" ? (
                  <textarea rows={4} {...common} className={`${inputClass} h-auto resize-y py-2 leading-relaxed`} />
                ) : f.type === "select" ? (
                  <select {...common} className={inputClass}>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    {...common}
                    type={f.type === "int" ? "number" : f.type === "money" ? "text" : f.type === "date" ? "date" : f.type === "email" ? "email" : f.type === "url" ? "url" : "text"}
                    inputMode={f.type === "money" ? "decimal" : undefined}
                    min={f.type === "int" ? 0 : undefined}
                    className={inputClass}
                  />
                )}
              </Field>
            </div>
          );
        })}
        {error && <p className="col-span-2 text-[13px] text-danger">{error}</p>}
        <div className="col-span-2 mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" disabled={busy}>
            {submit}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** A button that opens a RecordModal. */
export function NewButton({ children, variant = "primary", ...modal }: Omit<Parameters<typeof RecordModal>[0], "onClose"> & { children: React.ReactNode; variant?: "primary" | "secondary" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        {children}
      </Button>
      {open && <RecordModal {...modal} onClose={() => setOpen(false)} />}
    </>
  );
}

const IMAGE_MAX = 300 * 1024;

/** An image picked from the computer (kept as a data: address) or the address of one. */
function ImageInput({ value, onChange, onError }: { value: string; onChange: (v: string) => void; onError: (e: string) => void }) {
  const pick = (file?: File) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|gif|svg\+xml)$/.test(file.type)) return onError("Choisis une image PNG, JPEG, WebP, GIF ou SVG.");
    if (file.size > IMAGE_MAX) return onError("Cette image dépasse 300 Ko.");
    const reader = new FileReader();
    reader.onload = () => {
      onError("");
      onChange(String(reader.result));
    };
    reader.readAsDataURL(file);
  };
  const isData = value.startsWith("data:");
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-14 w-28 shrink-0 items-center justify-center rounded-lg border border-dashed border-line-strong bg-bg-2 p-2">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-[11.5px] text-ink-3">Aucune</span>
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <input
          type="text"
          value={isData ? "Image envoyée depuis l'ordinateur" : value}
          readOnly={isData}
          placeholder="https://… ou choisir un fichier"
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          aria-label="Adresse de l'image"
        />
        <div className="flex gap-2">
          <label className="press inline-flex h-7 cursor-pointer items-center rounded-lg border border-line-strong px-2.5 text-[12.5px] hover:bg-ink/5">
            Choisir un fichier
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          {value && (
            <button type="button" className="text-[12.5px] text-ink-3 hover:text-danger" onClick={() => onChange("")}>
              Retirer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
