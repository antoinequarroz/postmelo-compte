"use client";

import { ArrowUpRight, Check, Copy, KeyRound, Laptop, LogOut, Monitor, Moon, ShieldCheck, Smartphone, Sun, Trash2 } from "lucide-react";
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Admin } from "@/components/admin";
import { Logo } from "@/components/logo";
import { Avatar, Button, Card, Field, inputClass, Modal } from "@/components/ui";
import { authClient, message } from "@/lib/auth-client";
import { APP_NAME } from "@/lib/brand";
import { setTheme, type Theme, useTheme } from "@/lib/theme";
import { cn, dateTime, MIN_PASSWORD } from "@/lib/utils";

export type Me = { id: string; name: string; email: string; admin: boolean; twoFactor: boolean };
export type ToolInfo = { id: string; name: string; description: string; url: string; allowed: boolean };

export function Title({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <h2 className="text-[15px] font-medium">{children}</h2>
      {hint && <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{hint}</p>}
    </div>
  );
}

export function Account({ me, sessionToken, tools }: { me: Me; sessionToken: string; tools: ToolInfo[] }) {
  const signOut = async () => {
    await authClient.signOut();
    window.location.href = "/connexion";
  };
  return (
    <div className="mx-auto flex min-h-dvh max-w-[600px] flex-col gap-4 px-4 pb-16 pt-8">
      <header className="flex items-center gap-3 pb-2">
        <Logo className="size-9" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[28px] leading-none">{APP_NAME}</h1>
          <p className="mt-1 truncate text-[13px] text-ink-3">{me.email}</p>
        </div>
        <Button variant="ghost" onClick={signOut}>
          <LogOut className="size-4" />
          <span className="max-sm:hidden">Se déconnecter</span>
        </Button>
      </header>
      <Tools tools={tools} />
      <Profile me={me} />
      <Password />
      <TwoFactor enabled={me.twoFactor} />
      <Passkeys />
      <Devices current={sessionToken} />
      <Appearance />
      {me.admin && <Admin me={me} />}
    </div>
  );
}

function Tools({ tools }: { tools: ToolInfo[] }) {
  return (
    <Card className="flex flex-col gap-3">
      <Title hint={tools.length ? "Ton compte t'ouvre ces outils, sans autre mot de passe." : "Aucun outil n'est encore branché sur ce compte."}>Mes outils</Title>
      {tools.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {tools.map((t) => (
            <li key={t.id}>
              <a
                href={t.allowed ? t.url : undefined}
                aria-disabled={!t.allowed}
                className={cn("flex items-center gap-3 rounded-lg border border-line p-3", t.allowed ? "press hover:border-line-strong hover:bg-surface-2" : "opacity-50")}
              >
                <Avatar id={t.id} name={t.name} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium">{t.name}</span>
                  <span className="block truncate text-[12px] text-ink-3">{t.allowed ? t.description : "Pas ouvert à ton compte"}</span>
                </span>
                {t.allowed && <ArrowUpRight className="size-4 text-ink-3" />}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Profile({ me }: { me: Me }) {
  const [name, setName] = useState(me.name);
  const [saved, setSaved] = useState(me.name);
  const [busy, setBusy] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await authClient.updateUser({ name: name.trim() });
    setBusy(false);
    if (error) return void toast.error(message(error));
    setSaved(name.trim());
    toast("Nom enregistré");
  };
  return (
    <Card>
      <form onSubmit={save} className="flex flex-col gap-3">
        <Title hint="Le nom que les outils affichent pour toi.">Profil</Title>
        <Field label="Nom affiché">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputClass} />
        </Field>
        <Button variant="primary" className="self-start" disabled={busy || !name.trim() || name.trim() === saved}>
          Enregistrer
        </Button>
      </form>
    </Card>
  );
}

function Password() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: true });
    setBusy(false);
    if (error) return void toast.error(message(error));
    setCurrent("");
    setNext("");
    toast("Mot de passe changé. Les autres appareils sont déconnectés.");
  };
  return (
    <Card>
      <form onSubmit={save} className="flex flex-col gap-3">
        <Title hint="Un seul mot de passe pour tous les outils. Le changer déconnecte tes autres appareils.">Mot de passe</Title>
        <Field label="Mot de passe actuel">
          <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Nouveau mot de passe" hint={`${MIN_PASSWORD} caractères au moins.`}>
          <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} />
        </Field>
        <Button variant="primary" className="self-start" disabled={busy || !current || next.length < MIN_PASSWORD}>
          Changer le mot de passe
        </Button>
      </form>
    </Card>
  );
}

function BackupCodes({ codes }: { codes: string[] }) {
  const copy = async () => {
    await navigator.clipboard.writeText(codes.join("\n"));
    toast("Codes copiés");
  };
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] leading-relaxed text-ink-2">Garde ces codes de secours en lieu sûr (dans Cairn, par exemple). Chacun ouvre ton compte une fois si tu perds ton téléphone. Ils ne seront plus affichés.</p>
      <ul className="grid grid-cols-2 gap-1.5 rounded-lg border border-line bg-surface-2 p-3 font-mono text-[13px]">
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <Button className="self-start" onClick={copy}>
        <Copy className="size-4" />
        Copier
      </Button>
    </div>
  );
}

function TwoFactor({ enabled: initial }: { enabled: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [dialog, setDialog] = useState<null | "enable" | "disable" | "codes">(null);
  const [password, setPassword] = useState("");
  const [setup, setSetup] = useState<{ qr: string; secret: string; codes: string[] } | null>(null);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setDialog(null);
    setPassword("");
    setSetup(null);
    setCode("");
    setCodes(null);
    setError("");
  };

  const guard = async <T,>(action: () => Promise<{ data: T | null; error: Parameters<typeof message>[0] }>) => {
    setBusy(true);
    setError("");
    const { data, error } = await action();
    setBusy(false);
    if (error) setError(message(error));
    return error ? null : data;
  };

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await guard(() => authClient.twoFactor.enable({ password }));
    if (!data || !("totpURI" in data)) return;
    // The QR code is drawn here, in the browser: the secret never goes to another service.
    const qr = await QRCode.toDataURL(data.totpURI, { margin: 1, width: 220 });
    setSetup({ qr, secret: new URL(data.totpURI).searchParams.get("secret") ?? "", codes: data.backupCodes });
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await guard(() => authClient.twoFactor.verifyTotp({ code: code.replace(/\s/g, "") }));
    if (!data || !setup) return;
    setEnabled(true);
    setCodes(setup.codes);
    setSetup(null);
  };

  const disable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await guard(() => authClient.twoFactor.disable({ password })))) return;
    setEnabled(false);
    close();
    toast("Double authentification désactivée");
  };

  const renew = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await guard(() => authClient.twoFactor.generateBackupCodes({ password }));
    if (data) setCodes(data.backupCodes);
  };

  const askPassword = (onSubmit: (e: React.FormEvent) => void, label: string, danger = false) => (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <Field label="Ton mot de passe">
        <input autoFocus type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </Field>
      {error && <p className="text-[12.5px] text-danger">{error}</p>}
      <Button variant={danger ? "danger" : "primary"} className="self-start" disabled={busy || !password}>
        {label}
      </Button>
    </form>
  );

  return (
    <Card className="flex flex-col gap-3">
      <Title hint="En plus du mot de passe, un code à six chiffres donné par une application (1Password, Google Authenticator, Apple Mots de passe…).">Double authentification</Title>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-medium", enabled ? "bg-accent-soft text-accent" : "bg-ink/5 text-ink-2")}>
          {enabled && <ShieldCheck className="size-3.5" />}
          {enabled ? "Activée" : "Désactivée"}
        </span>
        <span className="flex-1" />
        {enabled ? (
          <>
            <Button onClick={() => setDialog("codes")}>Nouveaux codes de secours</Button>
            <Button variant="danger" onClick={() => setDialog("disable")}>
              Désactiver
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={() => setDialog("enable")}>
            Activer
          </Button>
        )}
      </div>

      {dialog === "enable" && (
        <Modal title={codes ? "C'est activé" : "Activer"} onClose={close}>
          {codes ? (
            <BackupCodes codes={codes} />
          ) : setup ? (
            <form onSubmit={confirm} className="flex flex-col gap-3">
              <p className="text-[13px] leading-relaxed text-ink-2">Scanne ce code avec ton application, puis entre le code à six chiffres qu&apos;elle affiche.</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setup.qr} alt="Code QR à scanner" width={180} height={180} className="self-center rounded-lg border border-line bg-white p-1" />
              <p className="break-all text-center font-mono text-[11.5px] text-ink-3">{setup.secret}</p>
              <input autoFocus inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123 456" maxLength={7} className={`${inputClass} text-center font-mono tracking-[0.2em]`} />
              {error && <p className="text-[12.5px] text-danger">{error}</p>}
              <Button variant="primary" className="self-start" disabled={busy || code.replace(/\s/g, "").length < 6}>
                Vérifier et activer
              </Button>
            </form>
          ) : (
            askPassword(start, "Continuer")
          )}
        </Modal>
      )}
      {dialog === "disable" && (
        <Modal title="Désactiver" onClose={close}>
          {askPassword(disable, "Désactiver la double authentification", true)}
        </Modal>
      )}
      {dialog === "codes" && (
        <Modal title="Codes de secours" onClose={close}>
          {codes ? <BackupCodes codes={codes} /> : askPassword(renew, "Créer de nouveaux codes")}
        </Modal>
      )}
    </Card>
  );
}

type Passkey = { id: string; name?: string | null; createdAt: string | Date };

function Passkeys() {
  const [list, setList] = useState<Passkey[] | null>(null);
  const [supported, setSupported] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await authClient.passkey.listUserPasskeys();
    setList((data as Passkey[] | null) ?? []);
  }, []);
  useEffect(() => {
    setSupported(typeof window.PublicKeyCredential !== "undefined");
    void load();
  }, [load]);

  const add = async () => {
    setBusy(true);
    const result = await authClient.passkey.addPasskey({ name: deviceName(navigator.userAgent) });
    setBusy(false);
    if (result?.error) return void toast.error(message(result.error));
    toast("Clé d'accès ajoutée");
    void load();
  };
  const remove = async (id: string) => {
    const { error } = await authClient.passkey.deletePasskey({ id });
    if (error) return void toast.error(message(error));
    void load();
  };

  return (
    <Card className="flex flex-col gap-3">
      <Title hint="Connecte-toi avec Face ID, Touch ID ou une clé de sécurité, sans taper de mot de passe.">Clés d&apos;accès</Title>
      {list && list.length > 0 && (
        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
          {list.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-3 py-2.5">
              <KeyRound className="size-4 text-ink-3" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px]">{p.name || "Clé d'accès"}</span>
                <span className="block text-[12px] text-ink-3">Ajoutée le {dateTime(p.createdAt)}</span>
              </span>
              <Button size="sm" variant="ghost" aria-label="Retirer cette clé" onClick={() => remove(p.id)}>
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {supported ? (
        <Button className="self-start" disabled={busy} onClick={add}>
          <KeyRound className="size-4" />
          Ajouter une clé d&apos;accès
        </Button>
      ) : (
        <p className="text-[12.5px] text-ink-3">Ce navigateur ne gère pas les clés d&apos;accès.</p>
      )}
    </Card>
  );
}

/** "Safari sur Mac", from a user agent: enough to recognise one's own devices. */
function deviceName(ua: string | null | undefined) {
  if (!ua) return "Appareil inconnu";
  const os = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android" : /Mac OS X|Macintosh/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "";
  const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "";
  return [browser, os].filter(Boolean).join(" sur ") || "Appareil inconnu";
}

type Device = { id: string; token: string; userAgent?: string | null; ipAddress?: string | null; updatedAt: string | Date };

function Devices({ current }: { current: string }) {
  const [list, setList] = useState<Device[] | null>(null);
  const load = useCallback(async () => {
    const { data } = await authClient.listSessions();
    setList(((data as Device[] | null) ?? []).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)));
  }, []);
  useEffect(() => void load(), [load]);

  const revoke = async (token: string) => {
    const { error } = await authClient.revokeSession({ token });
    if (error) return void toast.error(message(error));
    void load();
  };
  const revokeOthers = async () => {
    const { error } = await authClient.revokeOtherSessions();
    if (error) return void toast.error(message(error));
    toast("Les autres appareils sont déconnectés");
    void load();
  };

  return (
    <Card className="flex flex-col gap-3">
      <Title hint="Les navigateurs où ton compte est ouvert. Déconnecte ceux que tu ne reconnais pas.">Appareils connectés</Title>
      {list && (
        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
          {list.map((d) => {
            const Icon = /iPhone|Android/.test(d.userAgent ?? "") ? Smartphone : Laptop;
            return (
              <li key={d.id} className="flex items-center gap-3 px-3 py-2.5">
                <Icon className="size-4 text-ink-3" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px]">
                    {deviceName(d.userAgent)}
                    {d.token === current && <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">Cet appareil</span>}
                  </span>
                  <span className="block truncate text-[12px] text-ink-3">
                    Actif le {dateTime(d.updatedAt)}
                    {d.ipAddress ? ` · ${d.ipAddress}` : ""}
                  </span>
                </span>
                {d.token !== current && (
                  <Button size="sm" onClick={() => revoke(d.token)}>
                    Déconnecter
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {list && list.length > 1 && (
        <Button className="self-start" onClick={revokeOthers}>
          Déconnecter tous les autres
        </Button>
      )}
    </Card>
  );
}

const THEMES: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "system", label: "Système", Icon: Monitor },
  { value: "light", label: "Clair", Icon: Sun },
  { value: "dark", label: "Sombre", Icon: Moon },
];

function Appearance() {
  const theme = useTheme();
  return (
    <Card className="flex flex-col gap-3">
      <Title>Apparence</Title>
      <div className="flex gap-2">
        {THEMES.map(({ value, label, Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn("press flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border text-[13px]", theme === value ? "border-accent/60 bg-accent-soft text-ink" : "border-line-strong text-ink-2 hover:bg-surface-2")}
          >
            <Icon className="size-4" />
            {label}
            {theme === value && <Check className="size-3.5 text-accent" />}
          </button>
        ))}
      </div>
    </Card>
  );
}
