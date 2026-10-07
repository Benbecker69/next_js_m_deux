import type { Metadata } from "next";
import QRCode from "qrcode";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import { listLocations } from "@/lib/data/locations";
import { listSpaces } from "@/lib/data/spaces";
import { SPACE_TYPE_LABELS } from "@/types/domain";

// Pure test utility for the mobile app's camera check-in (QR = which space,
// GPS = still the proof of presence — see docs/api-mobile.md "Check-in par
// QR"). Not a real feature of the booking product: no dictionary entry, not
// in the sitemap, excluded from indexing below, and admin-gated like the
// rest of /admin even though it lives outside that route group (a tab here
// would misrepresent it as a real admin sub-section).
export const metadata: Metadata = {
  title: "QR codes de test — Repère",
  robots: { index: false, follow: false },
};

// Must match SPACE_QR_PREFIX in the mobile app's src/features/checkins/qr.ts.
function spaceQrPayload(spaceId: string): string {
  return `repere:space:${spaceId}`;
}

export default async function QrCodeTestPage() {
  await requireAdmin();
  const [locations, spaces] = await Promise.all([listLocations(), listSpaces()]);

  const cards = await Promise.all(
    spaces.map(async (space) => ({
      space,
      location: locations.find((item) => item.id === space.locationId) ?? null,
      svg: await QRCode.toString(spaceQrPayload(space.id), {
        type: "svg",
        margin: 1,
        width: 200,
      }),
    })),
  );

  const byLocation = new Map<string, typeof cards>();
  for (const card of cards) {
    const key = card.location?.id ?? "unknown";
    byLocation.set(key, [...(byLocation.get(key) ?? []), card]);
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-2xl font-medium text-ink">QR codes de test</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Un code par espace, à scanner depuis l’app mobile (écran « Scanner le code de
        l’espace » sur une réservation). Chaque code encode{" "}
        <code className="rounded-sm bg-paper px-1 py-0.5 text-xs">
          repere:space:&#123;id&#125;
        </code>{" "}
        — scanner celui d’un autre espace que celui réservé doit être refusé avec «
        Mauvais espace scanné ».
      </p>

      <div className="mt-10 flex flex-col gap-10">
        {locations
          .filter((location) => byLocation.has(location.id))
          .map((location) => (
            <section key={location.id}>
              <h2 className="font-display text-lg font-medium text-ink">
                {location.name}
                <span className="ml-2 font-sans text-sm font-normal text-ink-muted">
                  {location.city}
                </span>
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {byLocation.get(location.id)!.map(({ space, svg }) => (
                  <Card key={space.id} className="flex flex-col items-center text-center">
                    <CardHeader className="w-full items-center text-center">
                      <CardTitle>{space.name}</CardTitle>
                      <CardDescription>
                        <Badge variant="neutral">{SPACE_TYPE_LABELS[space.type]}</Badge>
                      </CardDescription>
                    </CardHeader>
                    {/* Server-generated SVG markup, not user input — safe to inline. */}
                    <div
                      className="rounded-sm bg-white p-2"
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                    <p className="mt-3 break-all font-mono text-xs text-ink-muted">
                      {space.id}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
