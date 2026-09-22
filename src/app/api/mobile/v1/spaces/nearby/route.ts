import { requireMobileUser } from "@/lib/mobile/auth";
import { handle, json, queryParams } from "@/lib/mobile/http";
import { listNearbySpaces } from "@/lib/mobile/nearby";
import { nearbyQuerySchema } from "@/lib/mobile/schemas";

export async function GET(request: Request) {
  return handle(async () => {
    await requireMobileUser(request);
    const query = nearbyQuerySchema.parse(queryParams(request));
    return json(
      await listNearbySpaces({
        lat: query.lat,
        lng: query.lng,
        startAt: query.startAt ? new Date(query.startAt) : undefined,
        endAt: query.endAt ? new Date(query.endAt) : undefined,
        limit: query.limit,
      }),
    );
  });
}
