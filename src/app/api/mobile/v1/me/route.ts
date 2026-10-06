import { requireMobileUser } from "@/lib/mobile/auth";
import { toMeDto } from "@/lib/mobile/dto";
import { ApiError, handle, json, readJsonBody } from "@/lib/mobile/http";
import { updateUser } from "@/lib/data/users";
import { profileSchema } from "@/lib/validation/profile";

export async function GET(request: Request) {
  return handle(async () => {
    const { user } = await requireMobileUser(request);
    return json({ user: toMeDto(user) });
  });
}

// Same fields, same schema, same repository call as the web's own "Profil"
// tab (`(app)/parametres/profil/_actions.ts`) — one shared row in `users`,
// so a name or member type changed here is exactly what the web next reads.
// Email and avatar stay out of scope: the web form itself doesn't edit them.
export async function PATCH(request: Request) {
  return handle(async () => {
    const { user } = await requireMobileUser(request);
    const body = profileSchema.parse(await readJsonBody(request));
    const updated = await updateUser(user.id, {
      name: body.name,
      memberType: body.memberType,
    });
    if (!updated) {
      throw new ApiError(404, "USER_NOT_FOUND", "Utilisateur introuvable.");
    }
    return json({ user: toMeDto(updated) });
  });
}
