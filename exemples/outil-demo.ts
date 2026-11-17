/**
 * Un outil minuscule qui se connecte avec le compte : sert d'exemple et de banc d'essai.
 *
 *   COMPTE_URL=http://localhost:3000 COMPTE_CLIENT_ID=cairn COMPTE_CLIENT_SECRET=… APP_URL=http://localhost:4000 \
 *     node --experimental-strip-types exemples/outil-demo.ts
 */
import http from "node:http";
import { CALLBACK_PATH, finishSignIn, PENDING_COOKIE, PENDING_MAX_AGE, signOutUrl, START_PATH, startSignIn, type Person } from "../clients/compte.ts";

const sessions = new Map<string, Person>();
const cookie = (req: http.IncomingMessage, name: string) =>
  (req.headers.cookie ?? "")
    .split(";")
    .map((c) => c.trim().split("="))
    .find(([k]) => k === name)?.[1];
const page = (body: string) => `<!doctype html><meta charset="utf-8"><title>Outil de démonstration</title><body style="font:16px system-ui;max-width:32rem;margin:4rem auto;padding:0 1rem">${body}`;
const escape = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

const port = Number(new URL(process.env.APP_URL ?? "http://localhost:4000").port || 4000);

http
  .createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", process.env.APP_URL ?? "http://localhost:4000");
    try {
      if (url.pathname === START_PATH) {
        const start = await startSignIn();
        res.writeHead(302, { Location: start.url, "Set-Cookie": `${PENDING_COOKIE}=${start.cookie}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${PENDING_MAX_AGE}` });
        return res.end();
      }
      if (url.pathname === CALLBACK_PATH) {
        const person = await finishSignIn(url.href, cookie(req, PENDING_COOKIE));
        const id = crypto.randomUUID();
        sessions.set(id, person);
        res.writeHead(302, { Location: "/", "Set-Cookie": [`demo_session=${id}; HttpOnly; SameSite=Lax; Path=/`, `${PENDING_COOKIE}=; Path=/; Max-Age=0`] });
        return res.end();
      }
      if (url.pathname === "/logout") {
        const id = cookie(req, "demo_session") ?? "";
        const person = sessions.get(id);
        sessions.delete(id);
        res.writeHead(302, { Location: (person && url.searchParams.has("partout") && (await signOutUrl(person.idToken))) || "/", "Set-Cookie": "demo_session=; Path=/; Max-Age=0" });
        return res.end();
      }
      const me = sessions.get(cookie(req, "demo_session") ?? "");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        page(
          me
            ? `<h1>Bonjour ${escape(me.name)}</h1><p id="identite">${escape(me.email)} · ${me.role} · double authentification : ${me.twoFactor ? "oui" : "non"}</p><p><a href="/logout">Quitter l'outil</a> · <a href="/logout?partout">Se déconnecter partout</a></p>`
            : `<h1>Outil de démonstration</h1><p><a href="${START_PATH}">Se connecter avec mon compte</a></p>`,
        ),
      );
    } catch (error) {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      res.end(page(`<h1>Connexion impossible</h1><p id="erreur">${escape((error as Error).message)}</p><p><a href="/">Retour</a></p>`));
    }
  })
  .listen(port, () => console.log(`Outil de démonstration sur http://localhost:${port}`));
