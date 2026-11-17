import { PostEditPage } from "@/server/admin-posts";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export default function Page(props: Props) {
  return <PostEditPage kind="blog" {...props} />;
}
