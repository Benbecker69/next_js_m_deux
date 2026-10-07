import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireOnboarded } from "@/lib/auth/session";
import { getLocale, getDictionary } from "@/lib/i18n/locale";
import { formatDateTime, formatDayLong, formatHourRange } from "@/lib/member/format";
import {
  cancelBlocker,
  reservationPhase,
  type MemberReservation,
} from "@/lib/member/reservations";
import { ApiError } from "@/lib/mobile/http";
import { getReservation } from "@/lib/mobile/reservations";
import { cn } from "@/lib/utils/cn";
import { SPACE_TYPE_LABELS, type SpaceType } from "@/types/domain";
import { ArrivalCard } from "./_components/arrival-card";
import { CancelReservationButton } from "./_components/cancel-reservation-button";

export const metadata: Metadata = {
  title: "Détail de la réservation",
};

/** The reservation of this member, or the 404 page — never someone else's. */
async function loadReservation(userId: string, id: string): Promise<MemberReservation> {
  try {
    return await getReservation(userId, id);
  } catch (error) {
    // "Not found" and "not yours" are one answer, on purpose.
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export default async function ReservationDetailPage({
  params,
}: PageProps<"/reservations/[id]">) {
  const { id } = await params;
  const [user, locale] = await Promise.all([requireOnboarded(), getLocale()]);
  const reservation = await loadReservation(user.id, id);

  const t = getDictionary(locale);
  const r = t.member.reservations;
  const nav = t.member.nav;
  const now = new Date();
  const phase = reservationPhase(reservation, now);
  const blocker = cancelBlocker(reservation, now);
  // Only a reservation still ahead gets the filled card: once it is over or
  // cancelled, the page stops insisting.
  const featured = phase === "upcoming";

  const status = {
    upcoming: { label: r.statusConfirmed, variant: "success" as const },
    past: { label: r.statusDone, variant: "neutral" as const },
    cancelled: { label: r.statusCancelled, variant: "danger" as const },
  }[phase];
  const creditsWord = reservation.creditsSpent === 1 ? nav.credit : nav.credits;
  const typeLabel =
    SPACE_TYPE_LABELS[reservation.space.type as SpaceType] ?? reservation.space.type;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-12">
      <Link
        href="/reservations"
        className="text-sm text-ink-muted transition-colors hover:text-ink"
      >
        {t.myReservations.backToList}
      </Link>

      <header
        className={cn(
          "mt-4 rounded-sm p-6",
          featured
            ? "bg-pine text-pine-contrast shadow-sm shadow-pine/25"
            : "border border-line bg-surface text-ink",
        )}
      >
        <div className="flex items-center justify-between gap-4 text-sm">
          <p className={featured ? "opacity-85" : "text-ink-muted"}>{typeLabel}</p>
          {featured ? (
            // On the filled card a tinted badge would not show: an outlined
            // label in the card's own text color instead.
            <span className="rounded-sm border border-pine-contrast/40 px-2 py-0.5 text-xs font-medium">
              {status.label}
            </span>
          ) : (
            <Badge variant={status.variant}>{status.label}</Badge>
          )}
        </div>
        <p className="mt-4 font-display text-lg font-medium">
          {formatDayLong(new Date(reservation.startAt), locale)}
        </p>
        <h1 className="font-display text-4xl font-medium leading-tight">
          {formatHourRange(reservation.startAt, reservation.endAt, locale)}
        </h1>
        <p className={cn("mt-3 font-medium", featured ? "opacity-95" : undefined)}>
          {reservation.space.name}
        </p>
        <div
          className={cn(
            "mt-1 flex flex-col gap-1 text-sm",
            featured ? "opacity-85" : "text-ink-muted",
          )}
        >
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            {reservation.location.name}, {reservation.location.address}
          </p>
          <p className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            {reservation.space.capacity} {r.capacity}
          </p>
        </div>
        <p
          className={cn(
            "mt-5 font-display text-xl font-medium tabular-nums",
            // Spent: red. Refunded: crossed out. Over: quiet.
            !featured && phase === "cancelled" && "text-ink-muted line-through",
            !featured && phase === "past" && "text-ink-muted",
          )}
        >
          -{reservation.creditsSpent} {creditsWord}
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-6">
        <ArrivalCard
          reservationId={reservation.id}
          state={reservation.checkIn.state}
          windowLabel={`${formatDateTime(reservation.checkIn.opensAt, locale)} → ${formatDateTime(reservation.checkIn.closesAt, locale)}`}
          doneLabel={
            reservation.checkIn.doneAt
              ? formatDateTime(reservation.checkIn.doneAt, locale)
              : null
          }
          t={r}
          geo={t.booking}
        />

        {blocker === null ? (
          <CancelReservationButton reservationId={reservation.id} t={t.myReservations} />
        ) : (
          // Says why there is no button, rather than leaving it looking forgotten.
          blocker !== "inactive" && (
            <p className="text-sm text-ink-muted">
              {blocker === "arrived" ? r.cannotCancelArrived : r.cannotCancelStarted}
            </p>
          )
        )}
      </div>
    </div>
  );
}
