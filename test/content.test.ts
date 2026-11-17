import { expect, test } from "vitest";
import { freshEnv } from "./helpers";

freshEnv();

test("the site starts with a welcome article in three languages and the products translated", async () => {
  const c = await import("@/server/content");
  for (const locale of ["fr", "en", "de"] as const) {
    const posts = c.listPosts({ kind: "blog", locale, published: true });
    expect(posts).toHaveLength(1);
    expect(c.listPosts({ kind: "changelog", locale, published: true }).length).toBeGreaterThan(0);
  }
  const welcome = c.listPosts({ kind: "blog", locale: "de", published: true })[0];
  expect(c.publishedTranslations(welcome.group_id)).toEqual({ fr: "bienvenue-sur-postmelo", en: "welcome-to-postmelo", de: "willkommen-bei-postmelo" });

  const de = c.localizedProducts("de");
  expect(de.find((p) => p.id === "lamio")?.category).toBe("Team-Chat");
  // German for Switzerland: never ß.
  expect(JSON.stringify(de)).not.toContain("ß");
  // French stays the catalogue as written in the admin.
  expect(c.localizedProducts("fr").find((p) => p.id === "lamio")?.category).toBe("Messagerie d'équipe");
});

test("a post is written, translated, published and found by its address", async () => {
  const c = await import("@/server/content");
  const id = c.createPost({ kind: "blog", locale: "fr", title: "Lamio arrive sur iPad !", body: "## Enfin\n\nLe **texte**." }, "Antoine");
  let post = c.listPosts({ kind: "blog" }).find((p) => p.id === id)!;
  expect(post).toMatchObject({ slug: "lamio-arrive-sur-ipad", status: "brouillon", published_at: null, author: "Antoine" });
  expect(c.getPublishedPost("blog", "fr", post.slug)).toBeNull();

  c.updatePost(id, { status: "publie" });
  post = c.listPosts({ kind: "blog" }).find((p) => p.id === id)!;
  expect(post.published_at).toBe(new Date().toISOString().slice(0, 10));
  expect(c.getPublishedPost("blog", "fr", "lamio-arrive-sur-ipad")?.id).toBe(id);

  // Translating makes a draft in the same group, with the same address.
  const en = c.translatePost(id, "en", "Antoine");
  expect(c.translatePost(id, "en")).toBe(en);
  const draft = c.listPosts({ kind: "blog", locale: "en" }).find((p) => p.id === en)!;
  expect(draft).toMatchObject({ group_id: post.group_id, status: "brouillon", slug: post.slug });
  c.updatePost(en, { title: "Lamio comes to iPad", slug: "Lamio comes to iPad", status: "publie" });
  expect(c.publishedTranslations(post.group_id)).toEqual({ fr: "lamio-arrive-sur-ipad", en: "lamio-comes-to-ipad" });
});

test("bad input is refused in French, and a post dated tomorrow waits for its day", async () => {
  const c = await import("@/server/content");
  expect(() => c.createPost({ kind: "blog", title: "  " })).toThrow("Le titre manque.");
  expect(() => c.createPost({ kind: "roman", title: "X" })).toThrow("type de publication");
  expect(() => c.createPost({ kind: "blog", locale: "it", title: "Ciao" })).toThrow("langue");
  expect(() => c.createPost({ kind: "changelog", title: "X", product_id: "nope" })).toThrow("Le produit n'existe pas.");
  expect(() => c.createPost({ kind: "changelog", title: "X", change: "magie" })).toThrow("type de changement");
  expect(() => c.createPost({ kind: "blog", locale: "fr", title: "Bienvenue sur Postmelo" })).toThrow("déjà cette adresse");
  // The same address is free in another language or the other kind.
  expect(() => c.createPost({ kind: "changelog", locale: "fr", title: "Bienvenue sur Postmelo" })).not.toThrow();

  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const id = c.createPost({ kind: "blog", locale: "en", title: "Coming soon", status: "publie", published_at: tomorrow });
  expect(c.getPublishedPost("blog", "en", "coming-soon")).toBeNull();
  expect(c.listPosts({ kind: "blog", locale: "en", published: true }).some((p) => p.id === id)).toBe(false);
  expect(() => c.removePost(id)).not.toThrow();
  expect(() => c.removePost(id)).toThrow("n'existe plus");
});

test("product translations are saved, and empty fields fall back to French", async () => {
  const c = await import("@/server/content");
  c.setProductText("cairn", "en", { category: "", tagline: "Notes, at home.", description: "" });
  const cairn = c.localizedProducts("en").find((p) => p.id === "cairn")!;
  expect(cairn.tagline).toBe("Notes, at home.");
  expect(cairn.category).toBe("Notes et coffre");
  expect(() => c.setProductText("cairn", "fr", {})).toThrow("fiche du produit");
  expect(() => c.setProductText("nope", "de", {})).toThrow("n'existe pas");
});

test("Markdown becomes safe HTML", async () => {
  const { markdownToHtml, plainText, readingMinutes } = await import("@/lib/markdown");
  expect(markdownToHtml("## Titre\n\nUn **gras** et *italique*.\n\n- a\n- b")).toBe("<h2>Titre</h2>\n<p>Un <strong>gras</strong> et <em>italique</em>.</p>\n<ul><li>a</li><li>b</li></ul>");
  expect(markdownToHtml("<script>alert(1)</script>")).toBe("<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
  expect(markdownToHtml("[x](javascript:alert(1))")).not.toContain("<a");
  expect(markdownToHtml("[x](javascript:void)")).toBe("<p>x</p>");
  expect(markdownToHtml("[site](https://postmelo.ch/a_b_c)")).toBe('<p><a href="https://postmelo.ch/a_b_c" rel="noopener noreferrer" target="_blank">site</a></p>');
  expect(markdownToHtml("[blog](/en/blog)")).toBe('<p><a href="/en/blog">blog</a></p>');
  expect(markdownToHtml('![a"b](https://x.ch/i.png)')).toContain('alt="a&quot;b"');
  expect(markdownToHtml("```\n<b>\n```")).toBe("<pre><code>&lt;b&gt;</code></pre>");
  expect(plainText("## Hello\n\n**World** [link](https://x)")).toBe("Hello World link");
  expect(readingMinutes("mot ".repeat(660))).toBe(3);
});
