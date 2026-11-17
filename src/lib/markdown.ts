/**
 * A small Markdown for the blog and the changelog, written in the admin: titles (## and ###),
 * paragraphs, lists, quotes, code, bold, italic, links and images. Everything else is text:
 * HTML is escaped, and links only go to http(s), mailto or a page of the site.
 */

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** A link the page may follow, or null. */
export function safeUrl(raw: string) {
  const url = raw.trim();
  if (/^(https?:\/\/|mailto:)/i.test(url)) return url;
  if (/^\/(?!\/)/.test(url) || url.startsWith("#")) return url;
  return null;
}

function inline(text: string): string {
  // Code first: what is inside stays as written.
  const parts = text.split(/(`[^`]+`)/g);
  return parts
    .map((part) => {
      if (/^`[^`]+`$/.test(part)) return `<code>${escape(part.slice(1, -1))}</code>`;
      let s = escape(part);
      // Links and images are set aside while the emphasis is applied, so their addresses stay intact.
      const kept: string[] = [];
      const keep = (html: string) => `\u0000${kept.push(html) - 1}\u0000`;
      s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt: string, url: string) => {
        const href = safeUrl(url.replace(/&amp;/g, "&"));
        return href ? keep(`<img src="${escape(href)}" alt="${alt}" loading="lazy" />`) : m;
      });
      s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label: string, url: string) => {
        const href = safeUrl(url.replace(/&amp;/g, "&"));
        if (!href) return label;
        const external = /^https?:\/\//i.test(href);
        return keep(`<a href="${escape(href)}"${external ? ' rel="noopener noreferrer" target="_blank"' : ""}>`) + `${label}</a>`;
      });
      s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      s = s.replace(/(^|[^*\w])\*([^*\s][^*]*)\*(?!\w)/g, "$1<em>$2</em>");
      s = s.replace(/(^|[^_\w])_([^_\s][^_]*)_(?!\w)/g, "$1<em>$2</em>");
      s = s.replace(/\u0000(\d+)\u0000/g, (_, n: string) => kept[Number(n)]);
      return s;
    })
    .join("");
}

export function markdownToHtml(source: string): string {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    // ``` code block
    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i++]);
      i++;
      out.push(`<pre><code>${escape(code.join("\n"))}</code></pre>`);
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      // A post already has its title (h1): # becomes h2.
      const level = Math.min(Math.max(heading[1].length, 2), 4);
      out.push(`<h${level}>${inline(heading[2].trim())}</h${level}>`);
      i++;
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      out.push("<hr />");
      i++;
      continue;
    }
    if (/^\s*>/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ""));
      out.push(`<blockquote>${markdownToHtml(quote.join("\n"))}</blockquote>`);
      continue;
    }
    const bullet = /^\s*[-*•]\s+/;
    const numbered = /^\s*\d+[.)]\s+/;
    if (bullet.test(line) || numbered.test(line)) {
      const ordered = numbered.test(line);
      const marker = ordered ? numbered : bullet;
      const items: string[] = [];
      while (i < lines.length && marker.test(lines[i])) {
        let item = lines[i++].replace(marker, "");
        // A line indented under the item continues it.
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !marker.test(lines[i])) item += " " + lines[i++].trim();
        items.push(`<li>${inline(item.trim())}</li>`);
      }
      out.push(`<${ordered ? "ol" : "ul"}>${items.join("")}</${ordered ? "ol" : "ul"}>`);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|\s*>|\s*[-*•]\s+|\s*\d+[.)]\s+)/.test(lines[i])) para.push(lines[i++].trim());
    if (!para.length) para.push(lines[i++].trim());
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

/** The text of a post without its Markdown, for summaries and descriptions. */
export function plainText(source: string, max = 180) {
  const text = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,4}\s+/gm, "")
    .replace(/^\s*([-*•]|\d+[.)]|>)\s+/gm, "")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max - 1).replace(/\s+\S*$/, "") + "…" : text;
}

/** Minutes of reading, at 220 words a minute. */
export const readingMinutes = (source: string) => Math.max(1, Math.round(plainText(source, 1e9).split(" ").length / 220));
