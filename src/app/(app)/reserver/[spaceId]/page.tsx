import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Users } from "lucide-react";
import { SpacePhoto } from "@/components/space-photo";
import { requireOnboarded } from "@/lib/auth/session";
import { getLocationById } from "@/lib/data/locations";
import { listReservationsBySpace } from "@/lib/data/reservations";
import { getSpaceById } from "@/lib/data/spaces";
import { SPACE_TYPE_LABELS } from "@/types/domain";
import { getLocale, getDictionary } from "@/lib/i18n/locale";
import { BookingPicker } from "./_components/booking-picker";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}): Promise<Metadata> {
  const { spaceId } = await params;
  const space = await getSpaceById(spaceId);
  return { title: space ? `Réserver — ${space.name}` : "Réserver" };
}

export default async function ReserveSpacePage({
  params,
}: PageProps<"/reserver/[spaceId]">) {
  const { spaceId } = await params;
  const [user, space, locale] = await Promise.all([
    requireOnboarded(),
    getSpaceById(spaceId),
    getLocale(),
  ]);
  if (!space || space.status !== "active") notFound();

  const t = getDictionary(locale);
  const [location, reservations] = await Promise.all([
    getLocationById(space.locationId),
    listReservationsBySpace(space.id),
  ]);

  // The picker only needs to know *when* the space is taken: who booked it
  // and for how much never leaves the server.
  const now = new Date();
  const busySlots = reservations
    .filter(
      (reservation) =>
        reservation.status === "confirmed" && new Date(reservation.endAt) > now,
    )
    .map((reservation) => ({ startAt: reservation.startAt, endAt: reservation.endAt }));

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
      <Link
        href="/reserver"
        className="text-sm text-ink-muted transition-colors hover:text-ink"
      >
        {t.booking.backToAllSpaces}
      </Link>

      <div className="mt-4 flex items-center gap-5 border-b border-line pb-8">
        <SpacePhoto type={space.type} />
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-medium text-ink">{space.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
            {space.name !== SPACE_TYPE_LABELS[space.type] && (
              <span>{SPACE_TYPE_LABELS[space.type]}</span>
            )}
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                {location.name}, {location.city}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
              {space.capacity} {t.bookingFlow.capacity}
            </span>
            <span>
              <span className="font-medium text-ink">{space.pricePerHour}</span>{" "}
              {t.bookingFlow.perHour}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-8">
        <BookingPicker
          space={{ id: space.id, pricePerHour: space.pricePerHour }}
          busySlots={busySlots}
          credits={user.credits}
          t={t.bookingFlow}
          submitLabel={t.booking.confirmBooking}
          submittingLabel={t.booking.confirming}
          locale={locale}
        />
      </div>
    </div>
  );
}
