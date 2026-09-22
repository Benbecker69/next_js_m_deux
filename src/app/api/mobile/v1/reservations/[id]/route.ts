import { requireMobileUser } from "@/lib/mobile/auth";
import { handle, json } from "@/lib/mobile/http";
import { getReservation } from "@/lib/mobile/reservations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const { user } = await requireMobileUser(request);
    const { id } = await params;
    return json({ reservation: await getReservation(user.id, id) });
  });
}
