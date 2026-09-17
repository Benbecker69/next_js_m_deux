import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { requireOnboarded } from "@/lib/auth/session";
import { listLocations } from "@/lib/data/locations";
import { listReservationsByUser } from "@/lib/data/reservations";
import { listSpaces } from "@/lib/data/spaces";
import { getLocale, getDictionary, INTL_LOCALE } from "@/lib/i18n/locale";

export const metadata: Metadata = {
  title: "Tableau de bord",
};

export default async function DashboardPage() {
  const [user, locale] = await Promise.all([requireOnboarded(), getLocale()]);
  const t = getDictionary(locale);
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
  const completed = reservations.filter(
    (reservation) =>
      reservation.status === "completed" ||
      (reservation.status === "confirmed" && new Date(reservation.startAt) <= now),
  );
  const creditsSpentTotal = reservations
    .filter((reservation) => reservation.status !== "cancelled")
    .reduce((total, reservation) => total + reservation.creditsSpent, 0);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-2xl font-medium text-ink">
        {t.dashboard.greeting}, {user.name.split(" ")[0]}.
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <StatCard label={t.dashboard.creditsRemaining} value={String(user.credits)} />
        <StatCard label={t.dashboard.upcomingCount} value={String(upcoming.length)} />
        <StatCard label={t.dashboard.completedCount} value={String(completed.length)} />
        <StatCard
          label={t.dashboard.creditsSpentTotal}
          value={String(creditsSpentTotal)}
        />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-lg font-medium text-ink">
          {t.dashboard.upcomingSectionTitle}
        </h2>
        <div className="mt-4">
          {upcoming.length === 0 ? (
            <EmptyState
              title={t.dashboard.emptyTitle}
              description={t.dashboard.emptyDescription}
              action={
                <Link href="/reserver" className={buttonVariants({ size: "sm" })}>
                  {t.common.bookSpace}
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
                      className="flex flex-col gap-1 transition-colors hover:text-pine sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-ink">
                        {space?.name ?? "Espace"} · {location?.name ?? ""}
                      </span>
                      <span className="text-ink-muted">
                        {new Date(reservation.startAt).toLocaleString(
                          INTL_LOCALE[locale],
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        )}
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
