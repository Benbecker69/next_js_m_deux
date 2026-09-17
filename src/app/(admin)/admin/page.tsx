import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { requireAdmin } from "@/lib/auth/session";
import { listLocations } from "@/lib/data/locations";
import { listReservations } from "@/lib/data/reservations";
import { listSpaces } from "@/lib/data/spaces";
import { listUsers } from "@/lib/data/users";
import { RESERVATION_STATUS_LABELS } from "@/types/domain";
import { getLocale, getDictionary, INTL_LOCALE } from "@/lib/i18n/locale";

export const metadata: Metadata = {
  title: "Administration",
};

export default async function AdminOverviewPage() {
  const [, locations, spaces, users, reservations, locale] = await Promise.all([
    requireAdmin(),
    listLocations(),
    listSpaces(),
    listUsers(),
    listReservations(),
    getLocale(),
  ]);
  const t = getDictionary(locale);

  const members = users.filter((user) => user.role === "member");
  const activeSpaces = spaces.filter((space) => space.status === "active");
  const confirmedReservations = reservations.filter(
    (reservation) => reservation.status === "confirmed",
  );

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const todayReservations = reservations.filter((reservation) => {
    const startAt = new Date(reservation.startAt);
    return (
      reservation.status !== "cancelled" &&
      startAt >= startOfToday &&
      startAt < startOfTomorrow
    );
  });

  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const newMembers = members.filter(
    (member) => new Date(member.createdAt) >= thirtyDaysAgo,
  );

  const creditsSpentTotal = reservations
    .filter((reservation) => reservation.status !== "cancelled")
    .reduce((total, reservation) => total + reservation.creditsSpent, 0);

  const recentReservations = [...reservations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl px-8 py-12">
      <h1 className="font-display text-2xl font-medium text-ink">
        {t.adminOverview.title}
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t.adminOverview.locationsLabel}
          value={String(locations.length)}
        />
        <StatCard
          label={t.adminOverview.activeSpacesLabel}
          value={String(activeSpaces.length)}
          hint={`${spaces.length} ${t.adminOverview.totalSuffix}`}
        />
        <StatCard label={t.adminOverview.membersLabel} value={String(members.length)} />
        <StatCard
          label={t.adminOverview.confirmedReservationsLabel}
          value={String(confirmedReservations.length)}
        />
        <StatCard
          label={t.adminOverview.todayReservationsLabel}
          value={String(todayReservations.length)}
        />
        <StatCard
          label={t.adminOverview.newMembersLabel}
          value={String(newMembers.length)}
          hint={t.adminOverview.last30DaysSuffix}
        />
        <StatCard
          label={t.adminOverview.creditsSpentLabel}
          value={String(creditsSpentTotal)}
        />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-lg font-medium text-ink">
          {t.adminOverview.recentReservationsTitle}
        </h2>
        {recentReservations.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            {t.adminOverview.noReservationsYet}
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
                      {new Date(reservation.startAt).toLocaleString(INTL_LOCALE[locale], {
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
