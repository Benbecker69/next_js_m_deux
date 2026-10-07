import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { Locale } from "@/lib/i18n/locale-constants";
import { formatDayLong, formatHourRange } from "@/lib/member/format";
import { startsInLabel, type MemberReservation } from "@/lib/member/reservations";

// The next reservation, featured: the one filled card of the member area, so
// "what is next" is the first thing read on the home page and on the list.
// When the arrival window is open the card says so and offers the action —
// the same card the mobile app opens on.
export function ReservationHero({
  reservation,
  now,
  locale,
  t,
  credits,
}: {
  reservation: MemberReservation;
  now: Date;
  locale: Locale;
  t: Dictionary["member"]["home"];
  /** "crédits", already agreed with the amount. */
  credits: string;
}) {
  const canCheckIn = reservation.checkIn.state === "available";
  const href = `/reservations/${reservation.id}`;

  return (
    <article className="rounded-sm bg-pine p-6 text-pine-contrast shadow-sm shadow-pine/25">
      <div className="flex items-center justify-between gap-4 text-sm">
        <p className="opacity-90">{t.nextEyebrow}</p>
        <p className="font-medium">{startsInLabel(reservation, now, t)}</p>
      </div>

      <p className="mt-4 font-display text-lg font-medium">
        {formatDayLong(new Date(reservation.startAt), locale)}
      </p>
      <p className="font-display text-4xl font-medium leading-tight">
        {formatHourRange(reservation.startAt, reservation.endAt, locale)}
      </p>
      <p className="mt-2 opacity-90">
        {reservation.space.name}, {reservation.location.name}
      </p>
      <p className="text-sm opacity-90">{reservation.location.address}</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-medium opacity-90">
          -{reservation.creditsSpent} {credits}
        </p>
        <div className="flex flex-wrap gap-3">
          {canCheckIn && (
            <Link
              href={`${href}#arrivee`}
              className={buttonVariants({ variant: "inverse", size: "sm" })}
            >
              {t.arrivalCta}
            </Link>
          )}
          <Link
            href={href}
            className={buttonVariants({ variant: "inverse-outline", size: "sm" })}
          >
            {t.seeBooking}
          </Link>
        </div>
      </div>
    </article>
  );
}
