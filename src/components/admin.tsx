"use client";

import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { type Me, Title } from "@/components/account";
import { Avatar, Button, Card, Field, inputClass, Modal } from "@/components/ui";
import { authClient, message } from "@/lib/auth-client";
import { api, cn, MIN_PASSWORD } from "@/lib/utils";

type Person = { id: string; name: string; email: string; role?: string | null; twoFactorEnabled?: boolean | null };
type Tool = { id: string; name: string; description: string; url: string };

/** For admins: the people who have an account, and the tools open to each of them. */
export function Admin({ me }: { me: Me }) {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [access, setAccess] = useState<Record<string, string[]>>({});
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);

  const load = useCallback(async () => {
    const [{ data }, acl] = await Promise.all([authClient.admin.listUsers({ query: { limit: 500, sortBy: "name" } }), api<{ tools: Tool[]; access: Record<string, string[]> }>("/api/admin/acces")]);
    setPeople((data?.users as Person[] | undefined) ?? []);
    setTools(acl.tools);
    setAccess(acl.access);
  }, []);
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
          <Title hint="Tu crées les comptes et tu choisis les outils ouverts à chacun. Les administrateurs ont accès à tout.">Personnes et accès</Title>
        </div>
        <Button variant="primary" onClick={() => setAdding(true)}>
          <Plus className="size-4" />
          Ajouter
        </Button>
      </div>

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
    const { error } = await authClient.admin.createUser({ name: name.trim(), email: email.trim().toLowerCase(), password, role: admin ? "admin" : "user", data: { emailVerified: true } });
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
    const { error } = await action();
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
