import { requireMobileUser } from "@/lib/mobile/auth";
import { handle, json, readJsonBody } from "@/lib/mobile/http";
import { changeEmailBodySchema } from "@/lib/mobile/schemas";
import { changeEmail } from "@/lib/mobile/security";

export async function POST(request: Request) {
  return handle(async () => {
    const { user } = await requireMobileUser(request);
    const body = changeEmailBodySchema.parse(await readJsonBody(request));
    return json(await changeEmail(user.id, body));
  });
}
