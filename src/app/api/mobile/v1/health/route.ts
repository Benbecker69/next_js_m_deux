import { json } from "@/lib/mobile/http";

// Liveness probe, also the first thing to open from the phone's browser to
// check the tunnel. `force-dynamic`: evaluated on every request, never frozen
// at build time.
export const dynamic = "force-dynamic";

export async function GET() {
  return json({
    status: "ok",
    api: "mobile",
    version: 1,
    time: new Date().toISOString(),
  });
}
