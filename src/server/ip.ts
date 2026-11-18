import net from "node:net";

/**
 * The address of the person, as Caddy saw it.
 *
 * Caddy, in front of this service, does not trust what a client writes in X-Forwarded-For: it
 * replaces the header with the address it received the connection from (no `trusted_proxies`
 * set). So the last address of the header is the one Caddy wrote, and only that one is read.
 * X-Real-IP is never read: Caddy does not set it, so a client could.
 *
 * Returns null when there is no usable address (a request that did not come through Caddy).
 */
export function clientIp(h: Headers | null | undefined): string | null {
  const forwarded = h?.get("x-forwarded-for");
  if (!forwarded) return null;
  const last = forwarded
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .pop();
  if (!last) return null;
  const mapped = /^::ffff:/i.test(last) && net.isIPv4(last.slice(7)) ? last.slice(7) : last;
  return net.isIP(mapped) ? mapped.toLowerCase() : null;
}

/** Expands an IPv6 address to its 8 groups of 4 hex digits. */
function ipv6Groups(ip: string) {
  const [left, right = ""] = ip.split("::");
  const head = left ? left.split(":") : [];
  const tail = ip.includes("::") && right ? right.split(":") : [];
  const middle = ip.includes("::") ? Array(8 - head.length - tail.length).fill("0") : [];
  return [...head, ...middle, ...tail].map((g) => g.padStart(4, "0"));
}

/**
 * The key a limit counts by: the address itself for IPv4, the /64 network for IPv6 (one
 * connection usually owns a whole /64, so counting single addresses would be easy to dodge).
 */
export function limitKey(ip: string | null) {
  if (!ip) return "sans-adresse";
  if (!net.isIPv6(ip)) return ip;
  return ipv6Groups(ip).slice(0, 4).join(":") + "::/64";
}
