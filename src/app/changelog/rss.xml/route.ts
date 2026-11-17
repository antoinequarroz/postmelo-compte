import { rssFeed } from "@/server/feeds";

export const dynamic = "force-dynamic";

export function GET() {
  return rssFeed("changelog", "fr");
}
