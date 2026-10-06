import { requireMobileUser } from "@/lib/mobile/auth";
import { handle, json } from "@/lib/mobile/http";
import { getMemberSummary } from "@/lib/mobile/summary";

export async function GET(request: Request) {
  return handle(async () => {
    const { user } = await requireMobileUser(request);
    return json(await getMemberSummary(user.id));
  });
}
