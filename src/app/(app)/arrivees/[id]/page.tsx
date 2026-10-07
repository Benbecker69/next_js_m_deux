import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, QrCode } from "lucide-react";
import { requireOnboarded } from "@/lib/auth/session";
import { getLocale, getDictionary } from "@/lib/i18n/locale";
import {
  formatDayLong,
  formatDayShort,
  formatDistance,
  formatHour,
  formatHourRange,
} from "@/lib/member/format";
import { checkInReasonLabel, type MemberCheckIn } from "@/lib/member/reservations";
import { getCheckIn } from "@/lib/mobile/checkin";
import { ApiError } from "@/lib/mobile/http";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Détail d'une arrivée",
};

/** The attempt of this member, or the 404 page — never someone else's. */
async function loadCheckIn(userId: string, id: string): Promise<MemberCheckIn> {
  try {
    return await getCheckIn(userId, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export default async function ArrivalDetailPage({ params }: PageProps<"/arrivees/[id]">) {
  const { id } = await params;
  const [user, locale] = await Promise.all([requireOnboarded(), getLocale()]);
  const checkIn = await loadCheckIn(user.id, id);

  const t = getDictionary(locale);
  const a = t.member.arrivals;
  const { reservation, accepted } = checkIn;
  const attemptedAt = new Date(checkIn.createdAt);
  const byQr = accepted && checkIn.scannedSpaceId !== null;

  const rows = [
    {
      label: a.bookedSlot,
      value: `${formatDayShort(new Date(reservation.startAt), locale)}, ${formatHourRange(reservation.startAt, reservation.endAt, locale)}`,
    },
    { label: a.distance, value: formatDistance(checkIn.distanceM, locale) },
    { label: a.accuracy, value: `± ${formatDistance(checkIn.accuracyM, locale)}` },
    ...(accepted
      ? [{ label: a.verification, value: byQr ? a.qrAndPosition : a.positionOnly }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-12">
      <Link
        href="/arrivees"
        className="text-sm text-ink-muted transition-colors hover:text-ink"
      >
        {a.back}
      </Link>

      {/* A validated arrival is the good outcome: it gets the filled card. A
          refused one stays quiet, with its reason in red. */}
      <header
        className={cn(
          "mt-4 rounded-sm p-6",
          accepted
            ? "bg-pine text-pine-contrast shadow-sm shadow-pine/25"
            : "border border-line bg-surface text-ink",
        )}
      >
        <p className={cn("text-sm", accepted ? "opacity-90" : "text-ink-muted")}>
          {accepted ? a.accepted : a.refused}
        </p>
        <p className="mt-4 font-display text-lg font-medium">
          {formatDayLong(attemptedAt, locale)}
        </p>
        <h1 className="font-display text-4xl font-medium leading-tight">
          {formatHour(attemptedAt, locale)}
        </h1>
        <p className={cn("mt-3", accepted ? "opacity-90" : "text-ink-muted")}>
          {reservation.space.name}, {reservation.location.name}
        </p>
        {byQr && (
          <p className="mt-2 flex items-center gap-2 text-sm opacity-90">
            <QrCode className="h-4 w-4" strokeWidth={1.75} />
            {a.qrAndPosition}
          </p>
        )}
        {!accepted && (
          <p className="mt-3 font-medium text-danger">
            {checkInReasonLabel(checkIn.reason, a)}
          </p>
        )}
      </header>

      <section className="mt-6 rounded-sm border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-medium text-ink">{a.detailsTitle}</h2>
        <dl className="mt-3 divide-y divide-line text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4 py-3">
              <dt className="text-ink-muted">{row.label}</dt>
              <dd className="text-right font-medium text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Link
        href={`/reservations/${checkIn.reservationId}`}
        className="mt-6 flex items-center justify-between gap-4 rounded-sm border border-line bg-surface p-4 font-medium text-ink transition-colors hover:border-pine"
      >
        {a.seeBooking}
        <ChevronRight className="h-4 w-4 text-ink-muted" strokeWidth={1.75} />
      </Link>
    </div>
  );
}
