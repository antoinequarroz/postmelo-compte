"use client";

import { ArrowLeft, Eye, ExternalLink, Languages, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ProductIcon } from "@/components/product-icon";
import { Button, Field, inputClass } from "@/components/ui";
import { day } from "@/lib/crm-labels";
import { LOCALE_NAME, LOCALE_SHORT, LOCALES, localePath, type Locale } from "@/lib/i18n";
import { markdownToHtml } from "@/lib/markdown";
import { primaryClass } from "@/lib/styles";
import { api, cn } from "@/lib/utils";
import type { Post, PostKind } from "@/server/content";
import { Badge, DeleteButton, Empty, selectClass } from "./kit";

type ProductOption = { id: string; name: string; color: string };

export const CHANGE_LABEL: Record<string, string> = { nouveau: "Nouveau", amelioration: "Amélioration", correction: "Correction" };
const CHANGE_TONE = { nouveau: "ok", amelioration: "accent", correction: "warn" } as const;

const SECTION: Record<PostKind, { path: string; one: string; empty: string }> = {
  blog: { path: "/admin/blog", one: "Article", empty: "Aucun article pour l'instant." },
  changelog: { path: "/admin/changelog", one: "Entrée", empty: "Aucune entrée dans le journal des versions." },
};

/** Where a published post is read on the public site. */
export const publicPath = (p: Pick<Post, "kind" | "locale" | "slug">) => localePath(p.locale, p.kind === "blog" ? `/blog/${p.slug}` : `/changelog#${p.slug}`);

const today = () => new Date().toISOString().slice(0, 10);
const isLive = (p: Post) => p.status === "publie" && !!p.published_at && p.published_at <= today();

function StatusBadge({ post }: { post: Post }) {
  if (post.status !== "publie") return <Badge>Brouillon</Badge>;
  if (!isLive(post)) return <Badge tone="warn">Prévu le {day(post.published_at)}</Badge>;
  return <Badge tone="ok">Publié</Badge>;
}

/** The posts of the blog or the changelog, all languages, with their translations side by side. */
export function PostList({ kind, posts, products }: { kind: PostKind; posts: Post[]; products: ProductOption[] }) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale | "all">("all");
  const section = SECTION[kind];
  const shown = locale === "all" ? posts : posts.filter((p) => p.locale === locale);
  const byGroup = useMemo(() => {
    const m = new Map<string, Post[]>();
    for (const p of posts) m.set(p.group_id, [...(m.get(p.group_id) ?? []), p]);
    return m;
  }, [posts]);
  const product = (id: string | null) => products.find((p) => p.id === id);

  const call = async (method: string, url: string, json: unknown, done: string) => {
    try {
      const res = await api<{ ok: true; id?: string }>(url, { method, json });
      toast(done);
      router.refresh();
      return res;
    } catch (e) {
      toast.error((e as Error).message);
      return null;
    }
  };
  const translate = async (post: Post, to: Locale) => {
    const res = await call("POST", `/api/site/posts/${post.id}/traduire`, { locale: to }, `Brouillon ${LOCALE_NAME[to]} créé`);
    if (res?.id) router.push(`${section.path}/${res.id}`);
  };

  return (
    <div className="flex flex-col gap-4 p-7 max-md:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-line-strong bg-surface p-0.5 shadow-card">
          {(["all", ...LOCALES] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className={cn("press h-7 rounded-md px-2.5 text-[12.5px] font-medium", locale === l ? "bg-accent-soft text-accent" : "text-ink-2 hover:text-ink")}
            >
              {l === "all" ? "Toutes les langues" : LOCALE_SHORT[l]}
            </button>
          ))}
        </div>
        <a href={localePath(locale === "all" ? "fr" : locale, kind === "blog" ? "/blog" : "/changelog")} target="_blank" className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-3 hover:text-ink">
          <ExternalLink className="size-3.5" /> Voir sur le site
        </a>
        <span className="ml-auto" />
        <Link href={`${section.path}/nouveau${locale !== "all" ? `?langue=${locale}` : ""}`} className={cn("press inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[13.5px] font-medium", primaryClass)}>
          <Plus className="size-4" /> {section.one}
        </Link>
      </div>

      {shown.length === 0 ? (
        <Empty>{section.empty}</Empty>
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          {shown.map((p) => {
            const siblings = byGroup.get(p.group_id) ?? [p];
            const missing = LOCALES.filter((l) => !siblings.some((s) => s.locale === l));
            const prod = product(p.product_id);
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <span className="w-8 shrink-0 text-center font-mono text-[11.5px] font-medium text-ink-3">{LOCALE_SHORT[p.locale]}</span>
                <div className="min-w-0 flex-1">
                  <Link href={`${section.path}/${p.id}`} className="block truncate text-[14px] font-medium hover:text-accent">
                    {p.title}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-3">
                    <StatusBadge post={p} />
                    {p.change && <Badge tone={CHANGE_TONE[p.change as keyof typeof CHANGE_TONE]}>{CHANGE_LABEL[p.change]}</Badge>}
                    {prod && (
                      <span className="inline-flex items-center gap-1">
                        <ProductIcon id={prod.id} color={prod.color} size="sm" className="size-4 rounded-[4px]" /> {prod.name}
                      </span>
                    )}
                    {p.version && <span className="font-mono">v{p.version}</span>}
                    {p.published_at && <span>{day(p.published_at)}</span>}
                    <span className="flex items-center gap-1">
                      {siblings
                        .filter((s) => s.id !== p.id)
                        .map((s) => (
                          <Link key={s.id} href={`${section.path}/${s.id}`} title={`Version ${LOCALE_NAME[s.locale]}`} className="rounded bg-ink/6 px-1 font-mono text-[10.5px] text-ink-2 hover:text-accent">
                            {LOCALE_SHORT[s.locale]}
                          </Link>
                        ))}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {missing.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => e.target.value && translate(p, e.target.value as Locale)}
                      className={selectClass}
                      aria-label="Traduire"
                    >
                      <option value="">Traduire…</option>
                      {missing.map((l) => (
                        <option key={l} value={l}>
                          {LOCALE_NAME[l]}
                        </option>
                      ))}
                    </select>
                  )}
                  {isLive(p) && (
                    <a href={publicPath(p)} target="_blank" className="press inline-flex h-7 items-center rounded-lg px-2 text-ink-3 hover:bg-ink/5 hover:text-ink" title="Voir sur le site">
                      <Eye className="size-3.5" />
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => call("PATCH", `/api/site/posts/${p.id}`, { status: p.status === "publie" ? "brouillon" : "publie" }, p.status === "publie" ? "Repassé en brouillon" : "Publié")}
                  >
                    {p.status === "publie" ? "Dépublier" : "Publier"}
                  </Button>
                  <Link href={`${section.path}/${p.id}`} className="press inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium text-ink-2 hover:bg-ink/5 hover:text-ink">
                    <Pencil className="size-3.5" /> Modifier
                  </Link>
                  <DeleteButton compact onConfirm={() => call("DELETE", `/api/site/posts/${p.id}`, {}, "Supprimé")} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {kind === "changelog" && (
        <p className="text-[12px] text-ink-3">
          Chaque entrée apparaît dans le journal des versions de sa langue. Écris le détail en liste : une ligne qui commence par « - » par changement.
        </p>
      )}
    </div>
  );
}

type Draft = { title: string; slug: string; excerpt: string; body: string; locale: Locale; status: string; published_at: string; product_id: string; version: string; change: string; author: string };

/** Writes one post, with the page as it will look beside the text. */
export function PostEditor({ kind, post, products, siblings = [], initialLocale = "fr" }: { kind: PostKind; post?: Post; products: ProductOption[]; siblings?: Post[]; initialLocale?: Locale }) {
  const router = useRouter();
  const section = SECTION[kind];
  const [d, setD] = useState<Draft>(() => ({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    body: post?.body ?? (kind === "changelog" ? "- " : ""),
    locale: post?.locale ?? initialLocale,
    status: post?.status ?? "brouillon",
    published_at: post?.published_at ?? "",
    product_id: post?.product_id ?? "",
    version: post?.version ?? "",
    change: post?.change ?? (kind === "changelog" ? "nouveau" : ""),
    author: post?.author ?? "",
  }));
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setD((v) => ({ ...v, [k]: e.target.value }));
  const html = useMemo(() => markdownToHtml(d.body), [d.body]);

  const save = async (status?: string) => {
    setBusy(true);
    const json = { ...d, kind, status: status ?? d.status, published_at: d.published_at || null };
    try {
      if (post) {
        await api(`/api/site/posts/${post.id}`, { method: "PATCH", json });
        toast(status === "publie" ? "Publié" : "Enregistré");
        if (status) setD((v) => ({ ...v, status }));
        router.refresh();
      } else {
        const res = await api<{ id: string }>("/api/site/posts", { method: "POST", json });
        toast(status === "publie" ? "Publié" : "Brouillon enregistré");
        router.replace(`${section.path}/${res.id}`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const live = post && post.status === "publie" && post.published_at && post.published_at <= today();

  return (
    <div className="flex flex-col gap-5 p-7 max-md:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={section.path} className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink">
          <ArrowLeft className="size-4" /> {kind === "blog" ? "Tous les articles" : "Tout le journal"}
        </Link>
        {post && <StatusBadge post={post} />}
        {siblings.length > 0 && (
          <span className="flex items-center gap-1 text-[12px] text-ink-3">
            <Languages className="size-3.5" />
            {siblings.map((s) => (
              <Link key={s.id} href={`${section.path}/${s.id}`} className="rounded bg-ink/6 px-1.5 py-0.5 font-mono text-[11px] text-ink-2 hover:text-accent">
                {LOCALE_SHORT[s.locale]}
              </Link>
            ))}
          </span>
        )}
        <span className="ml-auto" />
        {live && (
          <a href={publicPath(post)} target="_blank" className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-3 hover:text-ink">
            <ExternalLink className="size-3.5" /> Voir sur le site
          </a>
        )}
        <Button variant="ghost" className="lg:hidden" onClick={() => setPreview((p) => !p)}>
          <Eye className="size-4" /> {preview ? "Texte" : "Aperçu"}
        </Button>
        <Button onClick={() => save()} disabled={busy}>
          Enregistrer
        </Button>
        {d.status !== "publie" && (
          <Button variant="primary" onClick={() => save("publie")} disabled={busy}>
            Publier
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cn("flex flex-col gap-3", preview && "max-lg:hidden")}>
          <Field label="Titre">
            <input value={d.title} onChange={set("title")} className={`${inputClass} h-11 text-[16px] font-medium`} placeholder={kind === "blog" ? "Le titre de l'article" : "Ce qui a changé, en une phrase"} />
          </Field>
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <Field label="Langue">
              <select value={d.locale} onChange={set("locale")} className={inputClass}>
                {LOCALES.map((l) => (
                  <option key={l} value={l}>
                    {LOCALE_NAME[l]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date de publication" hint="Vide : le jour où tu publies. Une date future attend son jour.">
              <input type="date" value={d.published_at} onChange={set("published_at")} className={inputClass} />
            </Field>
          </div>
          {kind === "changelog" && (
            <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
              <Field label="Application">
                <select value={d.product_id} onChange={set("product_id")} className={inputClass}>
                  <option value="">Toute la suite</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Type">
                <select value={d.change} onChange={set("change")} className={inputClass}>
                  {Object.entries(CHANGE_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Version">
                <input value={d.version} onChange={set("version")} className={inputClass} placeholder="1.4" />
              </Field>
            </div>
          )}
          {kind === "blog" && (
            <Field label="Résumé" hint="Affiché dans la liste des articles et sur les réseaux.">
              <textarea rows={2} value={d.excerpt} onChange={set("excerpt")} className={`${inputClass} h-auto resize-y py-2 leading-relaxed`} />
            </Field>
          )}
          <Field label={kind === "blog" ? "Texte" : "Détail"} hint="Markdown : ## titre, - liste, **gras**, *italique*, [lien](https://…), ![image](https://…).">
            <textarea rows={kind === "blog" ? 22 : 8} value={d.body} onChange={set("body")} className={`${inputClass} h-auto resize-y py-2.5 font-mono text-[13px] leading-relaxed`} />
          </Field>
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <Field label="Adresse de la page" hint={`${localePath(d.locale, kind === "blog" ? "/blog/" : "/changelog#")}${d.slug || "…"}`}>
              <input value={d.slug} onChange={set("slug")} className={`${inputClass} font-mono text-[13px]`} placeholder="Tirée du titre si vide" />
            </Field>
            <Field label="Auteur" hint="Vide : ton nom.">
              <input value={d.author} onChange={set("author")} className={inputClass} />
            </Field>
          </div>
        </div>

        <div className={cn("lg:sticky lg:top-6 lg:self-start", !preview && "max-lg:hidden")}>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">Aperçu</p>
          <article className="max-h-[calc(100dvh-140px)] overflow-y-auto rounded-xl border border-line bg-surface p-7 shadow-card">
            <h1 className="font-display text-[34px] leading-[1.02]">{d.title || <span className="text-ink-3">Sans titre</span>}</h1>
            {d.excerpt && kind === "blog" && <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{d.excerpt}</p>}
            <div className="site-prose mt-6" dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        </div>
      </div>
    </div>
  );
}
