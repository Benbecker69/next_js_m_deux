import { requireMobileUser } from "@/lib/mobile/auth";
import { listCheckIns } from "@/lib/mobile/checkin";
import { handle, json, queryParams } from "@/lib/mobile/http";
import { listQuerySchema } from "@/lib/mobile/schemas";

export async function GET(request: Request) {
  return handle(async () => {
    const { user } = await requireMobileUser(request);
    const query = listQuerySchema.parse(queryParams(request));
    return json(await listCheckIns(user.id, query));
  });
}
