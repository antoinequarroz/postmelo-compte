import { getAuth } from "@/server/auth";

export const dynamic = "force-dynamic";

/** Everything Better Auth serves: sessions, second factor, passkeys and the OpenID Connect endpoints. */
const handle = async (req: Request) => (await getAuth()).handler(req);

export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
