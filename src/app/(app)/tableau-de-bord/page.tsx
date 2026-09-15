import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { requireOnboarded } from "@/lib/auth/session";
import { listLocations } from "@/lib/data/locations";
import { listReservationsByUser } from "@/lib/data/reservations";
import { listSpaces } from "@/lib/data/spaces";

export const metadata: Metadata = {
  title: "Tableau de bord",
};

export default async function DashboardPage() {
  const user = await requireOnboarded();
  const [reservations, spaces, locations] = await Promise.all([
    listReservationsByUser(user.id),
    listSpaces(),
    listLocations(),
  ]);

  const now = new Date();
  const upcoming = reservations
    .filter(
      (reservation) =>
        reservation.status === "confirmed" && new Date(reservation.startAt) > now,
    )
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <h1 className="font-display text-2xl font-medium text-ink">
        Bonjour, {user.name.split(" ")[0]}.
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <StatCard label="Crédits restants" value={String(user.credits)} />
        <StatCard label="Réservations à venir" value={String(upcoming.length)} />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-lg font-medium text-ink">
          Prochaines réservations
        </h2>
        <div className="mt-4">
          {upcoming.length === 0 ? (
            <EmptyState
              title="Aucune réservation à venir"
              description="Réservez un espace pour le voir apparaître ici."
              action={
                <Link href="/reserver" className={buttonVariants({ size: "sm" })}>
                  Réserver un espace
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {upcoming.map((reservation) => {
                const space = spaces.find((item) => item.id === reservation.spaceId);
                const location = space
                  ? locations.find((item) => item.id === space.locationId)
                  : null;
                return (
                  <li key={reservation.id} className="py-3 text-sm">
                    <Link
                      href={`/reservations/${reservation.id}`}
                      className="flex items-center justify-between transition-colors hover:text-pine"
                    >
                      <span className="text-ink">
                        {space?.name ?? "Espace"} · {location?.name ?? ""}
                      </span>
                      <span className="text-ink-muted">
                        {new Date(reservation.startAt).toLocaleString("fr-FR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
