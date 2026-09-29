import { requireMobileUser } from "@/lib/mobile/auth";
import { toMeDto } from "@/lib/mobile/dto";
import { handle, json } from "@/lib/mobile/http";

export async function GET(request: Request) {
  return handle(async () => {
    const { user } = await requireMobileUser(request);
    return json({ user: toMeDto(user) });
  });
}
