import { Changelog, changelogMetadata } from "@/components/site/blog";

export const dynamic = "force-dynamic";
export const metadata = changelogMetadata("fr");

type Props = { searchParams: Promise<{ app?: string | string[] }> };

export default async function Page({ searchParams }: Props) {
  const { app } = await searchParams;
  return <Changelog locale="fr" app={typeof app === "string" ? app : undefined} />;
}
