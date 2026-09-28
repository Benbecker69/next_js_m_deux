import { requireMobileUser } from "@/lib/mobile/auth";
import { getSpaceAvailability } from "@/lib/mobile/availability";
import { handle, json, queryParams } from "@/lib/mobile/http";
import { availabilityQuerySchema } from "@/lib/mobile/schemas";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    await requireMobileUser(request);
    const { id } = await params;
    const query = availabilityQuerySchema.parse(queryParams(request));
    return json(
      await getSpaceAvailability({
        spaceId: id,
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
      }),
    );
  });
}
