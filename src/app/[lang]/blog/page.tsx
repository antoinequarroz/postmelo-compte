import { BlogIndex, blogIndexMetadata } from "@/components/site/blog";
import { langParam } from "@/lib/lang-param";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  return blogIndexMetadata(await langParam(params));
}

export default async function Page({ params }: Props) {
  return <BlogIndex locale={await langParam(params)} />;
}
