import { Changelog, changelogMetadata } from "@/components/site/blog";
import { langParam } from "@/lib/lang-param";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ app?: string | string[] }> };

export async function generateMetadata({ params }: Props) {
  return changelogMetadata(await langParam(params));
}

export default async function Page({ params, searchParams }: Props) {
  const { app } = await searchParams;
  return <Changelog locale={await langParam(params)} app={typeof app === "string" ? app : undefined} />;
}
