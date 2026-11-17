export { default as cn } from "clsx";

export { APP_NAME } from "./brand";

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export const MIN_PASSWORD = 10;
export const MAX_PASSWORD = 200;

export async function api<T>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(url, init?.json !== undefined ? { ...init, headers: { "Content-Type": "application/json" }, body: JSON.stringify(init.json) } : init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Une erreur est survenue");
  return data as T;
}

export function dateTime(value: string | Date) {
  return new Date(value).toLocaleString("fr-CH", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}
