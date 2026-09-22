import { verifyUserCredentials } from "@/lib/data/users";
import { createMobileSession } from "@/lib/mobile/auth";
import { toMeDto } from "@/lib/mobile/dto";
import { ApiError, handle, json, readJsonBody } from "@/lib/mobile/http";
import {
  assertLoginAllowed,
  clearLoginFailures,
  recordLoginFailure,
} from "@/lib/mobile/rate-limit";
import { loginBodySchema } from "@/lib/mobile/schemas";

export async function POST(request: Request) {
  return handle(async () => {
    const body = loginBodySchema.parse(await readJsonBody(request));
    const key = body.email.trim().toLowerCase();
    assertLoginAllowed(key);

    const user = await verifyUserCredentials(body.email, body.password);
    if (!user) {
      recordLoginFailure(key);
      // Same answer for an unknown address and a wrong password.
      throw new ApiError(401, "INVALID_CREDENTIALS", "E-mail ou mot de passe incorrect.");
    }
    clearLoginFailures(key);

    const session = await createMobileSession(user.id, body.deviceName);
    return json({ ...session, user: toMeDto(user) });
  });
}
