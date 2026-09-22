import { requireMobileUser } from "@/lib/mobile/auth";
import { handle, json } from "@/lib/mobile/http";
import { cancelReservation } from "@/lib/mobile/reservations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const { user } = await requireMobileUser(request);
    const { id } = await params;
    return json(await cancelReservation(user.id, id));
  });
}
