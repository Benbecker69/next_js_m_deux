import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Navigation, Users } from "lucide-react";
import { PlacesMap } from "@/components/places-map";
import { SpacePhoto } from "@/components/space-photo";
import { buttonVariants } from "@/components/ui/button";
import { requireOnboarded } from "@/lib/auth/session";
import { getLocationById } from "@/lib/data/locations";
import { listReservationsBySpace } from "@/lib/data/reservations";
import { getSpaceById } from "@/lib/data/spaces";
import { directionsUrl } from "@/lib/geo/map";
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
  searchParams,
}: PageProps<"/reserver/[spaceId]">) {
  const [{ spaceId }, query] = await Promise.all([params, searchParams]);
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
          // Coming from "Réserver près de moi": the space is free right now,
          // so the first free hour is already picked.
          preselect={query.proche === "1"}
        />
      </div>

      {location && (
        <section className="mt-12 border-t border-line pt-8">
          <h2 className="font-display text-xl font-medium text-ink">
            {t.member.booking.whereTitle}
          </h2>
          <div className="mt-4 overflow-hidden rounded-sm border border-line bg-surface">
            <div className="p-3 pb-0">
              <PlacesMap
                pins={[
                  {
                    id: location.id,
                    name: location.name,
                    lat: location.lat,
                    lng: location.lng,
                    caption: location.address,
                  },
                ]}
                selectedId={location.id}
                heightClass="h-64"
                labels={{
                  label: t.member.booking.mapLabel,
                  locked: t.member.booking.mapLocked,
                  denied: t.member.booking.mapDenied,
                  enable: t.member.booking.mapEnable,
                }}
              />
            </div>
            {/* The address and the route are plain information: they stay
                even while the map waits for the location to be on. */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="font-medium text-ink">{location.name}</p>
                <p className="text-sm text-ink-muted">{location.address}</p>
              </div>
              <a
                href={directionsUrl(location)}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                <Navigation className="h-4 w-4" strokeWidth={1.75} />
                {t.member.booking.itinerary}
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
