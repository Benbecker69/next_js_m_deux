import { requireMobileUser, revokeMobileSession } from "@/lib/mobile/auth";
import { handle, noContent } from "@/lib/mobile/http";

// A real logout: the session is revoked on the server, so the token stops
// working even if it was copied somewhere before.
export async function POST(request: Request) {
  return handle(async () => {
    const { sessionId } = await requireMobileUser(request);
    await revokeMobileSession(sessionId);
    return noContent();
  });
}
