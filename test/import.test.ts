import Database from "better-sqlite3";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import path from "node:path";
import { expect, test } from "vitest";
import { Browser, freshEnv } from "./helpers";

freshEnv();

test("the import script brings Lamio's people over, with their passwords and their access", async () => {
  const { getAuth } = await import("@/server/auth");
  const { mayOpenTool } = await import("@/server/db");
  const auth = await getAuth();

  // A Lamio database, as Lamio writes it.
  const source = path.join(process.env.DATA_DIR!, "lamio-app.db");
  const lamio = new Database(source);
  lamio.exec(`
    create table users (id text primary key, email text not null unique, name text not null, role text not null default 'member', salt text not null, password_hash text not null, created_at text not null);
    create table module_access (module text not null, user_id text not null, primary key (module, user_id));
  `);
  const add = (id: string, email: string, name: string, role: string, password: string) => {
    const salt = crypto.randomBytes(16).toString("hex");
    lamio.prepare("insert into users values (?, ?, ?, ?, ?, ?, ?)").run(id, email, name, role, salt, crypto.scryptSync(password, salt, 32).toString("hex"), "2026-11-17T08:00:00.000Z");
  };
  add("u-antoine", "Antoine@Exemple.ch", "Antoine", "admin", "mot-de-passe-antoine");
  add("u-lea", "lea@exemple.ch", "Léa", "member", "mot-de-passe-lea");
  lamio.prepare("insert into module_access values ('notes', 'u-lea')").run();
  lamio.close();

  const run = () => execFileSync("node", ["scripts/import-lamio.mjs", source, process.env.DATA_DIR!], { encoding: "utf8" });
  expect(run()).toContain("2 compte(s) importé(s), 0 déjà présent(s), 1 accès");
  // Running it again changes nothing.
  expect(run()).toContain("0 compte(s) importé(s), 2 déjà présent(s), 0 accès");

  const browser = new Browser(auth.handler);
  const ok = await browser.post("/api/auth/sign-in/email", { email: "antoine@exemple.ch", password: "mot-de-passe-antoine" });
  expect(ok.status).toBe(200);
  const session = (await (await browser.fetch("/api/auth/get-session")).json()) as { user: { id: string; role: string } };
  expect(session.user).toMatchObject({ id: "u-antoine", role: "admin" });

  const wrong = await new Browser(auth.handler).post("/api/auth/sign-in/email", { email: "lea@exemple.ch", password: "mot-de-passe-antoine" });
  expect(wrong.status).toBe(401);
  expect(mayOpenTool("cairn", { id: "u-lea", role: "user" })).toBe(true);
  expect(mayOpenTool("metricove", { id: "u-lea", role: "user" })).toBe(false);
});
