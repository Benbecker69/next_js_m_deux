import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, ChevronRight, LocateFixed, Search } from "lucide-react";
import { DashLink } from "@/components/dash-link";
import { buttonVariants } from "@/components/ui/button";
import { requireOnboarded } from "@/lib/auth/session";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { formatDayLong, formatDayParts, formatHourRange } from "@/lib/member/format";
import { splitName } from "@/lib/member/name";
import { listReservations } from "@/lib/mobile/reservations";
import { getMemberSummary } from "@/lib/mobile/summary";
import { ReservationHero } from "../_components/reservation-hero";
import { ActivityPanel } from "./_components/activity-panel";

export const metadata: Metadata = {
  title: "Accueil",
};

// The next booking is featured, the following ones listed under it.
const UPCOMING_LIMIT = 4;

// Where the member lands once signed in. Read top to bottom it answers "what
// do I have next, what can I do, where do I stand" — the same order as the
// mobile app's home screen, and the same server functions behind it
// (`src/lib/mobile/`), so both show the same numbers.
export default async function HomePage() {
  const [user, locale] = await Promise.all([requireOnboarded(), getLocale()]);
  const t = getDictionary(locale);
  const [{ summary }, upcoming] = await Promise.all([
    getMemberSummary(user.id),
    listReservations(user.id, { scope: "upcoming", limit: UPCOMING_LIMIT }),
  ]);

  const now = new Date();
  const home = t.member.home;
  const nav = t.member.nav;
  const [next, ...later] = upcoming.items;
  const creditsWord = (count: number) => (count === 1 ? nav.credit : nav.credits);

  // Paris time: the greeting follows the member's afternoon, not the server's.
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Paris",
      hour: "numeric",
      hourCycle: "h23",
    }).format(now),
  );
  const firstName = splitName(user.name).firstName;

  const actions = [
    { href: "/reserver", label: home.actionFind, Icon: Search },
    { href: "/reserver#pres-de-moi", label: home.actionNear, Icon: LocateFixed },
    { href: "/arrivees", label: home.actionArrivals, Icon: BadgeCheck },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-3xl font-medium text-ink">
        {hour < 18 ? home.hello : home.evening} {firstName}
      </h1>
      <p className="mt-1 text-ink-muted">{formatDayLong(now, locale)}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-start">
        <div className="flex flex-col gap-8">
          {next ? (
            <ReservationHero
              reservation={next}
              now={now}
              locale={locale}
              t={home}
              credits={creditsWord(next.creditsSpent)}
            />
          ) : (
            // Same place and weight as the next reservation would have, so
            // the page keeps its shape for a new member.
            <div className="rounded-sm border border-dashed border-line p-6">
              <h2 className="font-display text-xl font-medium text-ink">
                {home.emptyTitle}
              </h2>
              <p className="mt-2 text-ink-muted">{home.emptyBody}</p>
              <Link href="/reserver" className={buttonVariants({ className: "mt-5" })}>
                {nav.book}
              </Link>
            </div>
          )}

          <ul className="grid grid-cols-3 gap-3">
            {actions.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex h-full flex-col items-center gap-3 rounded-sm border border-line bg-surface p-4 text-center text-sm font-medium text-ink transition-colors hover:border-pine"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pine/10 text-pine">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {later.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-display text-xl font-medium text-ink">
                  {home.laterTitle}
                </h2>
                <DashLink href="/reservations">{home.seeAll}</DashLink>
              </div>
              <ul className="mt-4 divide-y divide-line overflow-hidden rounded-sm border border-line bg-surface">
                {later.map((reservation) => {
                  const day = formatDayParts(new Date(reservation.startAt), locale);
                  return (
                    <li key={reservation.id}>
                      <Link
                        href={`/reservations/${reservation.id}`}
                        className="flex items-center gap-4 p-4 transition-colors hover:bg-paper"
                      >
                        {/* A small calendar tile: here the day is the first
                            thing to read. */}
                        <span className="flex w-14 shrink-0 flex-col items-center rounded-sm bg-paper py-1.5 text-xs text-ink-muted">
                          {day.weekday}
                          <span className="font-display text-xl font-medium leading-tight text-ink">
                            {day.day}
                          </span>
                          {day.month}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-lg font-medium text-ink">
                            {formatHourRange(
                              reservation.startAt,
                              reservation.endAt,
                              locale,
                            )}
                          </span>
                          <span className="block truncate text-sm text-ink-muted">
                            {reservation.space.name}, {reservation.location.name}
                          </span>
                        </span>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-ink-muted"
                          strokeWidth={1.75}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        <section>
          <h2 className="sr-only">{home.activityTitle}</h2>
          <ActivityPanel
            credits={user.credits}
            summary={summary}
            locale={locale}
            t={home}
            nav={nav}
          />
        </section>
      </div>
    </div>
  );
}
