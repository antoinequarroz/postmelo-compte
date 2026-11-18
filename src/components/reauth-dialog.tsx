"use client";

import { ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button, inputClass, Modal } from "@/components/ui";
import { onReauthRequest } from "@/lib/reauth";
import { api } from "@/lib/utils";

/** The "confirm with your code" dialog of the admin. Mounted once per page; opened by askForCode(). */
export function ReauthDialog() {
  const waiting = useRef<((ok: boolean) => void)[]>([]);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(
    () =>
      onReauthRequest(({ resolve }) => {
        waiting.current.push(resolve);
        setOpen(true);
      }),
    [],
  );

  const finish = (ok: boolean) => {
    for (const resolve of waiting.current.splice(0)) resolve(ok);
    setOpen(false);
    setCode("");
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/confirmer", { method: "POST", json: { code } }, { noReauth: true });
      finish(true);
    } catch (err) {
      setError((err as Error).message);
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;
  return (
    <Modal title="Confirme que c'est bien toi" onClose={() => finish(false)}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex items-start gap-3 text-[13px] leading-relaxed text-ink-2">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" />
          <p>Cette action est sensible. Tape le code à 6 chiffres de ton app d&apos;authentification : il reste valable 10 minutes pour les actions suivantes.</p>
        </div>
        <input
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]*"
          maxLength={7}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123 456"
          aria-label="Code à 6 chiffres"
          aria-invalid={!!error}
          className={`${inputClass} text-center font-mono text-[18px] tracking-[0.3em]`}
        />
        {error && (
          <p role="alert" className="text-[13px] text-danger">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => finish(false)}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={busy || code.replace(/\s/g, "").length !== 6}>
            Confirmer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
