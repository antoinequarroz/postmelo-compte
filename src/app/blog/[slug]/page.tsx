import { BlogPost, blogPostMetadata } from "@/components/site/blog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return blogPostMetadata("fr", (await params).slug);
}

export default async function Page({ params }: Props) {
  return <BlogPost locale="fr" slug={(await params).slug} />;
}
