#!/usr/bin/env node
/**
 * Copie les comptes de Lamio dans le service de compte : mêmes identifiants, mêmes mots de passe,
 * mêmes droits d'accès aux outils. Lamio n'est pas modifié (sa base est ouverte en lecture seule).
 *
 *   node scripts/import-lamio.mjs <chemin de app.db de Lamio> [dossier de données du compte]
 *
 * À lancer une fois que le service a démarré au moins une fois (il crée ses tables au démarrage).
 * Peut être relancé : les personnes déjà présentes (même id ou même e-mail) sont laissées telles quelles.
 */
import Database from "better-sqlite3";
import crypto from "node:crypto";
import path from "node:path";

/** Lamio's module ids, and the tool each one is here. */
const MODULE_TO_TOOL = { notes: "cairn", publication: "metricove", agenda: "alfred", studio: "nino", projets: "tickup" };

const [source, dataDir = process.env.DATA_DIR ?? "./data"] = process.argv.slice(2);
if (!source) {
  console.error("Usage : node scripts/import-lamio.mjs <app.db de Lamio> [dossier de données du compte]");
  process.exit(1);
}

const lamio = new Database(source, { readonly: true, fileMustExist: true });
const compte = new Database(path.join(path.resolve(dataDir), "compte.db"), { fileMustExist: true });
compte.pragma("foreign_keys = ON");

if (!compte.prepare("select 1 from sqlite_master where type = 'table' and name = 'user'").get()) {
  console.error("Le service de compte n'a pas encore créé ses tables : démarre-le une fois, puis relance.");
  process.exit(1);
}

const people = lamio.prepare("select id, email, name, role, salt, password_hash, created_at from users").all();
const hasAccess = !!lamio.prepare("select 1 from sqlite_master where type = 'table' and name = 'module_access'").get();
const access = hasAccess ? lamio.prepare("select module, user_id from module_access").all() : [];

const known = compte.prepare("select id from user where id = ? or lower(email) = ?");
const addUser = compte.prepare("insert into user (id, name, email, emailVerified, createdAt, updatedAt, role, banned, twoFactorEnabled) values (?, ?, ?, 1, ?, ?, ?, 0, 0)");
const addAccount = compte.prepare("insert into account (id, accountId, providerId, userId, password, createdAt, updatedAt) values (?, ?, 'credential', ?, ?, ?, ?)");
const addAccess = compte.prepare("insert or ignore into tool_access (tool, user_id) values (?, ?)");
const exists = compte.prepare("select 1 from user where id = ?");

let added = 0;
let kept = 0;
let opened = 0;
compte.transaction(() => {
  const now = new Date().toISOString();
  for (const p of people) {
    const email = p.email.toLowerCase();
    if (known.get(p.id, email)) {
      kept++;
      continue;
    }
    addUser.run(p.id, p.name, email, p.created_at, now, p.role === "admin" ? "admin" : "user");
    // "lamio1:" marks a hash made by Lamio: see src/server/password.ts.
    addAccount.run(crypto.randomBytes(24).toString("base64url"), p.id, p.id, `lamio1:${p.salt}:${p.password_hash}`, p.created_at, now);
    added++;
  }
  for (const a of access) {
    const tool = MODULE_TO_TOOL[a.module] ?? a.module;
    if (exists.get(a.user_id)) opened += addAccess.run(tool, a.user_id).changes;
  }
})();

console.log(`${added} compte(s) importé(s), ${kept} déjà présent(s), ${opened} accès à un outil repris.`);
