import { BlogIndex, blogIndexMetadata } from "@/components/site/blog";

export const dynamic = "force-dynamic";
export const metadata = blogIndexMetadata("fr");

export default function Page() {
  return <BlogIndex locale="fr" />;
}
