"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/lib/feedback/action-result";
import { useToast } from "@/lib/feedback/toast-provider";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { findNearestSpaceAction } from "../_actions";

/**
 * "Réserver près de moi" — the one-click way into booking, as in the mobile
 * app: read the position once, ask the server for the nearest space that is
 * free right now, and open its booking page with the first free hour already
 * picked.
 *
 * Client Component for the Geolocation API. The position is asked for at the
 * click, never when the page loads.
 */
export function NearMeCard({
  t,
  geo,
}: {
  t: Dictionary["member"]["booking"];
  geo: Pick<
    Dictionary["booking"],
    | "geoUnavailable"
    | "geoDenied"
    | "geoTimeout"
    | "geoPositionUnavailable"
    | "geoErrorTitle"
  >;
}) {
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const fail = (message: string, title: string) => {
    setError(message);
    showError(message, title);
    setLocating(false);
  };

  const search = () => {
    if (!("geolocation" in navigator)) {
      fail(geo.geoUnavailable, geo.geoErrorTitle);
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        startTransition(async () => {
          const result = await findNearestSpaceAction({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }).catch(() => ({ ok: false as const, error: MESSAGES.network }));
          if (!result.ok) {
            fail(result.error, t.nearTitle);
            return;
          }
          showSuccess(result.message, t.nearTitle);
          // `proche=1`: the booking page preselects the first free hour.
          router.push(`/reserver/${result.spaceId}?proche=1`);
        });
      },
      (positionError) => {
        if (positionError.code === positionError.PERMISSION_DENIED) {
          fail(geo.geoDenied, geo.geoErrorTitle);
        } else if (positionError.code === positionError.TIMEOUT) {
          fail(geo.geoTimeout, geo.geoErrorTitle);
        } else {
          fail(geo.geoPositionUnavailable, geo.geoErrorTitle);
        }
      },
      { timeout: 10_000 },
    );
  };

  const busy = locating || pending;

  return (
    <section
      id="pres-de-moi"
      // `scroll-mt`: the home page links straight to this block.
      className="scroll-mt-24 rounded-sm border border-pine/30 bg-pine/10 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-medium text-ink">{t.nearTitle}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t.nearBody}</p>
        </div>
        <Button type="button" onClick={search} disabled={busy}>
          <LocateFixed className="h-4 w-4" strokeWidth={1.75} />
          {busy ? t.nearSearching : t.nearCta}
        </Button>
      </div>
      {error && (
        <Alert variant="error" className="mt-4">
          {error}
        </Alert>
      )}
    </section>
  );
}
