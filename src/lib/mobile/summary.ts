import "server-only";
import { prisma } from "@/lib/db/prisma";

// Figures behind the mobile app's home screen. Computed here, not on the
// phone: the app only ever loads its lists page by page, so counting what it
// happens to have in memory would be wrong as soon as there is a second page.

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
// "Recent activity" is a rolling window rather than a calendar month: the
// server runs in UTC and the phone in its owner's time zone, so "this month"
// would not start at the same instant on both sides.
const WINDOW_DAYS = 30;
// The presence rate and the favourite place are read from the most recent
// finished bookings — plenty for a member's habits, and a bounded query.
const PAST_SAMPLE = 200;

export async function getMemberSummary(userId: string) {
  const now = new Date();
  const since = new Date(now.getTime() - WINDOW_DAYS * DAY_MS);

  const [upcomingCount, recent, past] = await Promise.all([
    // Same definition as `GET /reservations?scope=upcoming`.
    prisma.reservation.count({
      where: { userId, status: "confirmed", endAt: { gte: now } },
    }),
    prisma.reservation.findMany({
      where: { userId, status: { not: "cancelled" }, startAt: { gte: since, lte: now } },
      select: { startAt: true, endAt: true, creditsSpent: true },
    }),
    prisma.reservation.findMany({
      where: { userId, status: { not: "cancelled" }, endAt: { lt: now } },
      orderBy: { endAt: "desc" },
      take: PAST_SAMPLE,
      select: {
        space: { select: { location: { select: { id: true, name: true, city: true } } } },
        checkIns: { where: { accepted: true }, select: { id: true }, take: 1 },
      },
    }),
  ]);

  const recentMs = recent.reduce(
    (total, row) => total + (row.endAt.getTime() - row.startAt.getTime()),
    0,
  );

  // One entry per place, counting the finished bookings made there.
  const visits = new Map<
    string,
    { id: string; name: string; city: string; visits: number }
  >();
  for (const row of past) {
    const { location } = row.space;
    const entry = visits.get(location.id) ?? { ...location, visits: 0 };
    entry.visits += 1;
    visits.set(location.id, entry);
  }
  const favoriteLocation =
    [...visits.values()].sort((a, b) => b.visits - a.visits)[0] ?? null;

  return {
    summary: {
      windowDays: WINDOW_DAYS,
      upcoming: { count: upcomingCount },
      recent: {
        reservations: recent.length,
        // One decimal is enough: slots are whole hours, older ones half hours.
        hours: Math.round((recentMs / HOUR_MS) * 10) / 10,
        creditsSpent: recent.reduce((total, row) => total + row.creditsSpent, 0),
      },
      // The app turns these two into a percentage; `past` can be 0.
      attendance: {
        past: past.length,
        attended: past.filter((row) => row.checkIns.length > 0).length,
      },
      favoriteLocation,
    },
  };
}
