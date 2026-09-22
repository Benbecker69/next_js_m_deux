import { requireMobileUser } from "@/lib/mobile/auth";
import { handle, json, queryParams, readJsonBody } from "@/lib/mobile/http";
import { createReservation, listReservations } from "@/lib/mobile/reservations";
import { listQuerySchema } from "@/lib/mobile/schemas";
import { createReservationSchema } from "@/lib/validation/reservation";

export async function GET(request: Request) {
  return handle(async () => {
    const { user } = await requireMobileUser(request);
    const query = listQuerySchema.parse(queryParams(request));
    return json(await listReservations(user.id, query));
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const { user } = await requireMobileUser(request);
    // Same schema as the web booking form: spaceId + ISO start/end, end after start.
    const body = createReservationSchema.parse(await readJsonBody(request));
    const result = await createReservation(user.id, {
      spaceId: body.spaceId,
      startAt: new Date(body.startAt),
      endAt: new Date(body.endAt),
    });
    return json(result, 201);
  });
}
