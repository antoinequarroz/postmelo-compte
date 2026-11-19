"use client";

import { Check, Copy, Mail, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { type Me, Title } from "@/components/account";
import { Avatar, Button, Card, Field, inputClass, Modal } from "@/components/ui";
import { authClient, message } from "@/lib/auth-client";
import { askForCode, REAUTH_REQUIRED } from "@/lib/reauth";
import { api, cn, dateTime, MIN_PASSWORD } from "@/lib/utils";

type Person = { id: string; name: string; email: string; role?: string | null; twoFactorEnabled?: boolean | null };
type Tool = { id: string; name: string; description: string; url: string };
type Invite = { id: string; email: string; name: string; createdAt: number; expiresAt: number };

/** For admins: the people who have an account, and the tools open to each of them. */
export function Admin({ me }: { me: Me }) {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [access, setAccess] = useState<Record<string, string[]>>({});
  const [invites, setInvites] = useState<Invite[]>([]);
  const [adding, setAdding] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);

  const load = useCallback(async () => {
    const [{ data }, acl, inv] = await Promise.all([
      authClient.admin.listUsers({ query: { limit: 500, sortBy: "name" } }),
      api<{ tools: Tool[]; access: Record<string, string[]> }>("/api/admin/acces"),
      api<{ invites: Invite[] }>("/api/admin/invitations"),
    ]);
    setPeople((data?.users as Person[] | undefined) ?? []);
    setTools(acl.tools);
    setAccess(acl.access);
    setInvites(inv.invites);
  }, []);

  const withdraw = async (invite: Invite) => {
    try {
      await api("/api/admin/invitations", { method: "DELETE", json: { id: invite.id } });
      toast(`Invitation de ${invite.email} retirée`);
    } catch (e) {
      toast.error((e as Error).message);
    }
    void load();
  };
  useEffect(() => void load().catch((e) => toast.error((e as Error).message)), [load]);

  const toggle = async (tool: string, userId: string, allowed: boolean) => {
    // Shown at once, put back if the server refuses.
    const before = access;
    setAccess({ ...access, [tool]: allowed ? [...(access[tool] ?? []), userId] : (access[tool] ?? []).filter((id) => id !== userId) });
    try {
      await api("/api/admin/acces", { method: "POST", json: { tool, userId, allowed } });
    } catch (e) {
      setAccess(before);
      toast.error((e as Error).message);
    }
  };

  return (
    <Card id="personnes" className="flex scroll-mt-6 flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Title hint="Tu invites les personnes, ou tu crées leur compte toi-même, et tu choisis les outils ouverts à chacun. Les administrateurs ont accès à tout.">Personnes et accès</Title>
        </div>
        <Button variant="primary" onClick={() => setInviting(true)}>
          <Mail className="size-4" />
          Inviter
        </Button>
        <Button onClick={() => setAdding(true)}>
          <Plus className="size-4" />
          Créer
        </Button>
      </div>

      {invites.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[12px] font-medium text-ink-3">Invitations en attente</p>
          <ul className="flex flex-col divide-y divide-line rounded-lg border border-dashed border-line">
            {invites.map((i) => (
              <li key={i.id} className="flex items-center gap-3 px-3 py-2.5">
                <Mail className="size-4 shrink-0 text-ink-3" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px]">{i.name ? `${i.name} · ${i.email}` : i.email}</span>
                  <span className="block text-[12px] text-ink-3">Valable jusqu&apos;au {dateTime(new Date(i.expiresAt))}</span>
                </span>
                <Button size="sm" variant="ghost" onClick={() => withdraw(i)}>
                  Retirer
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
        {(people ?? []).map((p) => {
          const admin = p.role === "admin";
          return (
            <li key={p.id} className="flex flex-col gap-2.5 px-3 py-3">
              <div className="flex items-center gap-3">
                <Avatar id={p.id} name={p.name} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium">
                    {p.name}
                    {p.id === me.id && <span className="ml-1.5 font-normal text-ink-3">(toi)</span>}
                  </span>
                  <span className="block truncate text-[12px] text-ink-3">
                    {p.email} · {admin ? "Administrateur" : "Membre"}
                    {p.twoFactorEnabled ? " · double authentification" : ""}
                  </span>
                </span>
                {p.id !== me.id && (
                  <Button size="sm" onClick={() => setEditing(p)}>
                    Gérer
                  </Button>
                )}
              </div>
              {tools.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-11">
                  {tools.map((t) => {
                    const on = admin || (access[t.id] ?? []).includes(p.id);
                    return (
                      <button
                        key={t.id}
                        disabled={admin}
                        aria-pressed={on}
                        title={admin ? "Les administrateurs ont accès à tout" : on ? `Fermer ${t.name}` : `Ouvrir ${t.name}`}
                        onClick={() => toggle(t.id, p.id, !on)}
                        className={cn("press h-7 rounded-full border px-2.5 text-[12px] font-medium disabled:opacity-60", on ? "border-accent/50 bg-accent-soft text-accent" : "border-line-strong text-ink-3 hover:bg-surface-2")}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {inviting && (
        <InvitePerson
          onClose={() => {
            setInviting(false);
            void load();
          }}
        />
      )}
      {adding && (
        <AddPerson
          onClose={() => setAdding(false)}
          onDone={() => {
            setAdding(false);
            void load();
          }}
        />
      )}
      {editing && (
        <ManagePerson
          person={editing}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            void load();
          }}
        />
      )}
    </Card>
  );
}

/** Makes an invitation link for one address. The link is shown once: the admin sends it to that address. */
function InvitePerson({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [made, setMade] = useState<{ email: string; link: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      setMade(await api<{ email: string; link: string }>("/api/admin/invitations", { method: "POST", json: { name: name.trim(), email: email.trim() } }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    if (!made) return;
    await navigator.clipboard.writeText(made.link);
    setCopied(true);
  };

  if (made) {
    const mail = `mailto:${encodeURIComponent(made.email)}?${new URLSearchParams({ subject: "Ton invitation à Postmelo", body: `Bonjour${name.trim() ? ` ${name.trim()}` : ""},\n\nVoici ton lien pour créer ton compte Postmelo. Il marche une seule fois, pendant 7 jours :\n\n${made.link}\n` }).toString().replace(/\+/g, "%20")}`;
    return (
      <Modal title="Invitation prête" onClose={onClose}>
        <div className="flex flex-col gap-3">
          <p className="text-[13px] leading-relaxed text-ink-2">
            Envoie ce lien à <span className="font-medium text-ink">{made.email}</span>, et à personne d&apos;autre : il ouvre un compte à cette adresse, une seule fois, pendant 7 jours. Il ne sera plus affiché ensuite.
          </p>
          <input readOnly value={made.link} onFocus={(e) => e.currentTarget.select()} className={`${inputClass} font-mono text-[12px]`} />
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={copy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copié" : "Copier le lien"}
            </Button>
            <a href={mail} className="press inline-flex h-9 items-center gap-2 rounded-full border border-line-strong px-4 text-[13px] font-medium hover:bg-[var(--glass-05)]">
              <Mail className="size-4" />
              Écrire l&apos;e-mail
            </a>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Inviter une personne" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label="Nom" hint="Facultatif : elle pourra le changer.">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputClass} />
        </Field>
        <Field label="E-mail" hint="Le compte prendra cette adresse.">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} className={inputClass} />
        </Field>
        {error && <p className="text-[12.5px] text-danger">{error}</p>}
        <Button variant="primary" className="self-start" disabled={busy || !email.trim()}>
          Créer le lien d&apos;invitation
        </Button>
      </form>
    </Modal>
  );
}

function AddPerson({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const create = () => authClient.admin.createUser({ name: name.trim(), email: email.trim().toLowerCase(), password, role: admin ? "admin" : "user", data: { emailVerified: true } });
    let { error } = await create();
    if (error && (error as { code?: string }).code === REAUTH_REQUIRED) {
      if (!(await askForCode())) return setBusy(false);
      ({ error } = await create());
    }
    setBusy(false);
    if (error) return setError(message(error));
    toast(`Compte créé pour ${name.trim()}`);
    onDone();
  };

  return (
    <Modal title="Ajouter une personne" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label="Nom">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputClass} />
        </Field>
        <Field label="E-mail">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Mot de passe provisoire" hint={`${MIN_PASSWORD} caractères au moins. Transmets-le lui : elle le changera dans son compte.`}>
          <input value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" className={`${inputClass} font-mono`} />
        </Field>
        <label className="flex items-center gap-2 text-[13px] text-ink-2">
          <input type="checkbox" checked={admin} onChange={(e) => setAdmin(e.target.checked)} className="size-4 accent-[var(--accent)]" />
          Administrateur (accès à tous les outils)
        </label>
        {error && <p className="text-[12.5px] text-danger">{error}</p>}
        <Button variant="primary" className="self-start" disabled={busy || !name.trim() || !email.trim() || password.length < MIN_PASSWORD}>
          Créer le compte
        </Button>
      </form>
    </Modal>
  );
}

function ManagePerson({ person, onClose, onDone }: { person: Person; onClose: () => void; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const admin = person.role === "admin";

  const act = async (action: () => Promise<{ error: Parameters<typeof message>[0] }>, done: string, close = true) => {
    setBusy(true);
    let { error } = await action();
    // A change of role, password or account: the code is asked again, then the action is retried once.
    if (error && (error as { code?: string }).code === REAUTH_REQUIRED) {
      setBusy(false);
      if (!(await askForCode())) return;
      setBusy(true);
      ({ error } = await action());
    }
    setBusy(false);
    if (error) return void toast.error(message(error));
    toast(done);
    if (close) onDone();
  };

  return (
    <Modal title={person.name} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void act(async () => {
              const first = await authClient.admin.setUserPassword({ userId: person.id, newPassword: password });
              return first.error ? first : authClient.admin.revokeUserSessions({ userId: person.id });
            }, "Mot de passe remplacé, ses appareils sont déconnectés");
          }}
        >
          <Field label="Nouveau mot de passe provisoire" hint="Si elle a oublié le sien.">
            <input value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" className={`${inputClass} font-mono`} />
          </Field>
          <Button className="self-start" disabled={busy || password.length < MIN_PASSWORD}>
            Remplacer le mot de passe
          </Button>
        </form>
        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          <Button disabled={busy} onClick={() => act(() => authClient.admin.setRole({ userId: person.id, role: admin ? "user" : "admin" }), admin ? "Redevenu membre" : "Devenu administrateur")}>
            {admin ? "Retirer le rôle d'administrateur" : "Rendre administrateur"}
          </Button>
          <Button disabled={busy} onClick={() => act(() => authClient.admin.revokeUserSessions({ userId: person.id }), "Ses appareils sont déconnectés")}>
            Déconnecter ses appareils
          </Button>
          <Button variant="danger" disabled={busy} onClick={() => window.confirm(`Supprimer le compte de ${person.name} ? Cette personne ne pourra plus entrer dans aucun outil.`) && act(() => authClient.admin.removeUser({ userId: person.id }), "Compte supprimé")}>
            <Trash2 className="size-3.5" />
            Supprimer le compte
          </Button>
        </div>
      </div>
    </Modal>
  );
}
