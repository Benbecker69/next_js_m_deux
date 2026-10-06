import { requireMobileUser } from "@/lib/mobile/auth";
import { handle, noContent, readJsonBody } from "@/lib/mobile/http";
import { changePasswordBodySchema } from "@/lib/mobile/schemas";
import { changePassword } from "@/lib/mobile/security";

export async function POST(request: Request) {
  return handle(async () => {
    const { user, sessionId } = await requireMobileUser(request);
    const body = changePasswordBodySchema.parse(await readJsonBody(request));
    await changePassword(user.id, sessionId, body);
    return noContent();
  });
}
