"use client";

import { useState } from "react";
import { BadgeCheck, LocateFixed } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/feedback/toast-provider";
import { useRunAction } from "@/lib/feedback/use-run-action";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { MemberReservation } from "@/lib/member/reservations";
import { checkInAction } from "../_actions";

type ArrivalState = MemberReservation["checkIn"]["state"];

/**
 * The "arrival" block of a reservation: where the member stands in the
 * arrival window and, while it is open, the button that validates the
 * arrival.
 *
 * Client Component because validating needs the browser's Geolocation API.
 * The position is read once, at the click — never when the page opens — then
 * sent to `checkInAction`, and the server alone decides (same rules as the
 * mobile app). A refusal is not an error of the page: the sentence says why
 * and the button stays, to try again.
 */
export function ArrivalCard({
  reservationId,
  state,
  windowLabel,
  doneLabel,
  t,
  geo,
}: {
  reservationId: string;
  state: ArrivalState;
  /** "6 oct., 13h45 → 6 oct., 17h", already formatted by the server. */
  windowLabel: string;
  /** "6 oct., 13h52" when the arrival is validated. */
  doneLabel: string | null;
  t: Dictionary["member"]["reservations"];
  geo: Pick<
    Dictionary["booking"],
    | "geoUnavailable"
    | "geoDenied"
    | "geoTimeout"
    | "geoPositionUnavailable"
    | "geoErrorTitle"
  >;
}) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const { run, pending, error } = useRunAction();
  const { showError } = useToast();

  // Nothing to say about arrival on a cancelled reservation.
  if (state === "unavailable") return null;

  const failLocating = (message: string) => {
    setGeoError(message);
    showError(message, geo.geoErrorTitle);
    setLocating(false);
  };

  const validate = () => {
    if (!("geolocation" in navigator)) {
      failLocating(geo.geoUnavailable);
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        run(() =>
          checkInAction(reservationId, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracyM: position.coords.accuracy,
            capturedAt: new Date(position.timestamp).toISOString(),
          }),
        );
      },
      (positionError) => {
        if (positionError.code === positionError.PERMISSION_DENIED) {
          failLocating(geo.geoDenied);
        } else if (positionError.code === positionError.TIMEOUT) {
          failLocating(geo.geoTimeout);
        } else {
          failLocating(geo.geoPositionUnavailable);
        }
      },
      // The server refuses a position vaguer than 100 m or older than a
      // minute: ask for the best fix, and never a cached one.
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 },
    );
  };

  const body = {
    available: t.arrivalAvailable,
    too_early: t.arrivalTooEarly,
    expired: t.arrivalExpired,
    done: t.arrivalDone,
  }[state];
  const busy = locating || pending;

  return (
    <section
      id="arrivee"
      // `scroll-mt`: the home page links straight to this block.
      className="scroll-mt-24 rounded-sm border border-line bg-surface p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-medium text-ink">{t.arrivalTitle}</h2>
        {state === "too_early" && <Badge variant="warning">{t.pillTooEarly}</Badge>}
        {state === "expired" && <Badge variant="warning">{t.pillExpired}</Badge>}
        {state === "done" && <Badge variant="success">{t.pillDone}</Badge>}
      </div>

      <p className="mt-2 flex items-start gap-2 text-ink">
        {state === "done" && (
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-pine" strokeWidth={1.75} />
        )}
        {body}
      </p>
      {(state === "available" || state === "too_early") && (
        <p className="mt-1 text-sm text-ink-muted">
          {t.window} : {windowLabel}
        </p>
      )}
      {doneLabel && (
        <p className="mt-1 text-sm text-ink-muted">
          {t.validatedOn} {doneLabel}
        </p>
      )}

      {state === "available" && (
        <div className="mt-5 flex flex-col gap-3">
          {(geoError ?? error) && <Alert variant="error">{geoError ?? error}</Alert>}
          <div>
            <Button type="button" onClick={validate} disabled={busy}>
              <LocateFixed className="h-4 w-4" strokeWidth={1.75} />
              {locating ? t.locating : pending ? t.checkingIn : t.checkInCta}
            </Button>
          </div>
          {/* Said before the browser asks: why the position is needed. */}
          <p className="text-sm text-ink-muted">{t.checkInHint}</p>
          <p className="text-sm text-ink-muted">{t.qrNote}</p>
        </div>
      )}
    </section>
  );
}
