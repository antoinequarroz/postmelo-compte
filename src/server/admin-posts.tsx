import "server-only";
import { notFound } from "next/navigation";
import { PostEditor, PostList } from "@/components/crm/posts";
import { PageHeader } from "@/components/ui";
import { isLocale } from "@/lib/i18n";
import { listPosts, type PostKind } from "./content";
import { listProducts } from "./crm";

/** The admin pages of the blog and the changelog are the same, one kind each. */

const TITLES: Record<PostKind, { title: string; subtitle: string; new: string }> = {
  blog: { title: "Blog", subtitle: "Les articles de postmelo.ch, en français, en anglais et en allemand.", new: "Nouvel article" },
  changelog: { title: "Journal des versions", subtitle: "Les nouveautés et corrections de chaque application, publiées sur le site.", new: "Nouvelle entrée" },
};

const productOptions = () => listProducts().map((p) => ({ id: p.id, name: p.name, color: p.color }));

export function PostListPage({ kind }: { kind: PostKind }) {
  const posts = listPosts({ kind });
  const published = posts.filter((p) => p.status === "publie").length;
  return (
    <>
      <PageHeader title={TITLES[kind].title} subtitle={`${TITLES[kind].subtitle} ${published} publié${published > 1 ? "s" : ""} sur ${posts.length}.`} />
      <PostList kind={kind} posts={posts} products={productOptions()} />
    </>
  );
}

export async function PostEditPage({ kind, params, searchParams }: { kind: PostKind; params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const lang = (await searchParams).langue;
  if (id === "nouveau") {
    return (
      <>
        <PageHeader title={TITLES[kind].new} />
        <PostEditor kind={kind} products={productOptions()} initialLocale={isLocale(lang) ? lang : "fr"} />
      </>
    );
  }
  const all = listPosts({ kind });
  const post = all.find((p) => p.id === id);
  if (!post) notFound();
  return (
    <>
      <PageHeader title={post.title} subtitle={TITLES[kind].title} />
      <PostEditor key={post.id} kind={kind} post={post} products={productOptions()} siblings={all.filter((p) => p.group_id === post.group_id && p.id !== post.id)} />
    </>
  );
}
