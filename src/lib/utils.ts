export { default as cn } from "clsx";

export { APP_NAME } from "./brand";

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export const MIN_PASSWORD = 10;
export const MAX_PASSWORD = 200;

export async function api<T>(url: string, init?: RequestInit & { json?: unknown }, opts?: { noReauth?: boolean }): Promise<T> {
  const send = () => fetch(url, init?.json !== undefined ? { ...init, headers: { "Content-Type": "application/json" }, body: JSON.stringify(init.json) } : init);
  let res = await send();
  let data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
  // A sensitive admin action: ask for the code once, then send the same request again.
  if (res.status === 403 && data.code === "REAUTH_REQUIRED" && !opts?.noReauth && typeof window !== "undefined") {
    const { askForCode } = await import("@/lib/reauth");
    if (!(await askForCode())) throw new Error("Action annulée.");
    res = await send();
    data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
  }
  if (!res.ok) throw new Error(data.error ?? "Une erreur est survenue");
  return data as T;
}

export function dateTime(value: string | Date) {
  return new Date(value).toLocaleString("fr-CH", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}
