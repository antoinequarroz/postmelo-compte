import { PostListPage } from "@/server/admin-posts";

export const dynamic = "force-dynamic";

export default function Page() {
  return <PostListPage kind="changelog" />;
}
