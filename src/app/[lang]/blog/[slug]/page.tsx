import { BlogPost, blogPostMetadata } from "@/components/site/blog";
import { langParam } from "@/lib/lang-param";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  return blogPostMetadata(await langParam(params), (await params).slug);
}

export default async function Page({ params }: Props) {
  return <BlogPost locale={await langParam(params)} slug={(await params).slug} />;
}
