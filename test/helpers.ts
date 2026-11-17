import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const ISSUER_ORIGIN = "http://localhost:3000";
export const TOOL_URL = "http://localhost:4000";
export const TOOL_SECRET = "s".repeat(40);

/** A fresh data directory and one tool (Cairn) switched on. Call before importing the server modules. */
export function freshEnv() {
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "compte-test-"));
  process.env.COMPTE_URL = ISSUER_ORIGIN;
  process.env.CAIRN_URL = TOOL_URL;
  process.env.CAIRN_CLIENT_SECRET = TOOL_SECRET;
}

/** A tiny browser: keeps cookies between calls to the auth handler, never follows redirects. */
export class Browser {
  private jar = new Map<string, string>();
  constructor(private handler: (req: Request) => Promise<Response>) {}

  async fetch(url: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    if (this.jar.size) headers.set("cookie", [...this.jar].map(([k, v]) => `${k}=${v}`).join("; "));
    if (init.method && init.method !== "GET" && !headers.has("origin")) headers.set("origin", ISSUER_ORIGIN);
    const res = await this.handler(new Request(url.startsWith("http") ? url : ISSUER_ORIGIN + url, { ...init, headers, redirect: "manual" }));
    for (const line of res.headers.getSetCookie()) {
      const [pair, ...attrs] = line.split(";");
      const at = pair.indexOf("=");
      const name = pair.slice(0, at).trim();
      const gone = attrs.some((a) => /^\s*max-age=0\s*$/i.test(a));
      if (gone) this.jar.delete(name);
      else this.jar.set(name, pair.slice(at + 1).trim());
    }
    return res;
  }

  post(url: string, json: unknown) {
    return this.fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(json) });
  }
}
