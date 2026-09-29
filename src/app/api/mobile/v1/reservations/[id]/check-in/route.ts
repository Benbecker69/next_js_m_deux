import { requireMobileUser } from "@/lib/mobile/auth";
import { performCheckIn } from "@/lib/mobile/checkin";
import { handle, json, readJsonBody } from "@/lib/mobile/http";
import { checkInBodySchema } from "@/lib/mobile/schemas";

// 201 whether the attempt is accepted or refused: either way a row was
// recorded. The app must read `checkIn.accepted` and `checkIn.reason`.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const { user } = await requireMobileUser(request);
    const { id } = await params;
    const body = checkInBodySchema.parse(await readJsonBody(request));
    const result = await performCheckIn(user.id, id, {
      lat: body.lat,
      lng: body.lng,
      accuracyM: body.accuracyM,
      capturedAt: new Date(body.capturedAt),
    });
    return json(result, 201);
  });
}
