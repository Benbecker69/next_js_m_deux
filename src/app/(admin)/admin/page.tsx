import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { requireAdmin } from "@/lib/auth/session";
import { listLocations } from "@/lib/data/locations";
import { listReservations } from "@/lib/data/reservations";
import { listSpaces } from "@/lib/data/spaces";
import { listUsers } from "@/lib/data/users";
import { RESERVATION_STATUS_LABELS } from "@/types/domain";

export const metadata: Metadata = {
  title: "Administration",
};

export default async function AdminOverviewPage() {
  const [, locations, spaces, users, reservations] = await Promise.all([
    requireAdmin(),
    listLocations(),
    listSpaces(),
    listUsers(),
    listReservations(),
  ]);

  const members = users.filter((user) => user.role === "member");
  const activeSpaces = spaces.filter((space) => space.status === "active");
  const confirmedReservations = reservations.filter(
    (reservation) => reservation.status === "confirmed",
  );

  const recentReservations = [...reservations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl px-8 py-12">
      <h1 className="font-display text-2xl font-medium text-ink">Vue d&apos;ensemble</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lieux" value={String(locations.length)} />
        <StatCard
          label="Espaces actifs"
          value={String(activeSpaces.length)}
          hint={`${spaces.length} au total`}
        />
        <StatCard label="Membres" value={String(members.length)} />
        <StatCard
          label="Réservations confirmées"
          value={String(confirmedReservations.length)}
        />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-lg font-medium text-ink">
          Dernières réservations
        </h2>
        {recentReservations.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            Aucune réservation pour l&apos;instant.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {recentReservations.map((reservation) => {
              const space = spaces.find((item) => item.id === reservation.spaceId);
              const location = space
                ? locations.find((item) => item.id === space.locationId)
                : null;
              const member = users.find((item) => item.id === reservation.userId);
              const badge = RESERVATION_STATUS_LABELS[reservation.status];
              return (
                <li
                  key={reservation.id}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <div>
                    <p className="text-ink">
                      {member?.name ?? "Utilisateur"} · {space?.name ?? "Espace"} —{" "}
                      {location?.name ?? ""}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {new Date(reservation.startAt).toLocaleString("fr-FR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
