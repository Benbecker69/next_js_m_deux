import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { requireOnboarded } from "@/lib/auth/session";
import { getLocale, getDictionary } from "@/lib/i18n/locale";
import { formatHourRange } from "@/lib/member/format";
import {
  dayHeaderLabel,
  groupByDay,
  reservationPhase,
  type MemberReservation,
} from "@/lib/member/reservations";
import { listReservations } from "@/lib/mobile/reservations";
import { cn } from "@/lib/utils/cn";
import { ReservationHero } from "../_components/reservation-hero";

export const metadata: Metadata = {
  title: "Mes réservations",
};

// `?vue=` in the URL → the scope the server filters on. "À venir" is the
// default: it is what a member opens this page for.
const VIEWS = {
  "a-venir": "upcoming",
  passees: "past",
  toutes: "all",
} as const;
type View = keyof typeof VIEWS;

// The server caps a page; a member's list fits well under this.
const LIST_LIMIT = 100;

// The view lives in the URL (searchParams), not in client state — a
// bookmarkable link and a server-rendered result, no client JavaScript for
// something this simple. Same three views as the mobile app, and the same
// server function behind them.
export default async function ReservationsPage({
  searchParams,
}: PageProps<"/reservations">) {
  const [user, params, locale] = await Promise.all([
    requireOnboarded(),
    searchParams,
    getLocale(),
  ]);
  const t = getDictionary(locale);
  const r = t.member.reservations;
  const nav = t.member.nav;

  const view: View =
    typeof params.vue === "string" && params.vue in VIEWS
      ? (params.vue as View)
      : "a-venir";
  const { items } = await listReservations(user.id, {
    scope: VIEWS[view],
    limit: LIST_LIMIT,
  });

  const now = new Date();
  // Only "À venir" is sorted soonest first, so only there is the first item
  // really the next one.
  const hero = view === "a-venir" ? items[0] : undefined;
  const sections = groupByDay(hero ? items.slice(1) : items, (item) => item.startAt);
  const creditsWord = (count: number) => (count === 1 ? nav.credit : nav.credits);

  const tabs: { view: View; label: string }[] = [
    { view: "a-venir", label: r.scopeUpcoming },
    { view: "passees", label: r.scopePast },
    { view: "toutes", label: r.scopeAll },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-medium text-ink">
          {t.myReservations.title}
        </h1>
        <Link href="/reserver" className={buttonVariants({ size: "sm" })}>
          {nav.book}
        </Link>
      </div>

      <nav className="mt-6 inline-flex flex-wrap items-center gap-1 rounded-sm border border-line bg-paper p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.view}
            href={
              tab.view === "a-venir" ? "/reservations" : `/reservations?vue=${tab.view}`
            }
            aria-current={view === tab.view ? "page" : undefined}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm transition-colors",
              view === tab.view
                ? "bg-surface text-pine shadow-sm"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 flex flex-col gap-8">
        {items.length === 0 && (
          <EmptyState
            title={view === "a-venir" ? r.emptyUpcomingTitle : r.emptyTitle}
            description={view === "a-venir" ? r.emptyUpcomingBody : r.emptyBody}
            action={
              view === "a-venir" ? (
                <Link href="/reserver" className={buttonVariants({ size: "sm" })}>
                  {nav.book}
                </Link>
              ) : undefined
            }
          />
        )}

        {hero && (
          <ReservationHero
            reservation={hero}
            now={now}
            locale={locale}
            t={t.member.home}
            credits={creditsWord(hero.creditsSpent)}
          />
        )}

        {/* One block per day, like a calendar: the day is the heading, each
            row only has to give the hours. */}
        {sections.map((section) => (
          <section key={section.key}>
            <h2 className="font-display text-lg font-medium text-ink first-letter:uppercase">
              {dayHeaderLabel(section.date, now, r, locale)}
            </h2>
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-sm border border-line bg-surface">
              {section.items.map((reservation) => (
                <ReservationRow
                  key={reservation.id}
                  reservation={reservation}
                  now={now}
                  hours={formatHourRange(reservation.startAt, reservation.endAt, locale)}
                  credits={creditsWord(reservation.creditsSpent)}
                  labels={r}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function ReservationRow({
  reservation,
  now,
  hours,
  credits,
  labels,
}: {
  reservation: MemberReservation;
  now: Date;
  hours: string;
  credits: string;
  labels: { statusConfirmed: string; statusDone: string; statusCancelled: string };
}) {
  const phase = reservationPhase(reservation, now);
  const status = {
    upcoming: { label: labels.statusConfirmed, variant: "success" as const },
    past: { label: labels.statusDone, variant: "neutral" as const },
    cancelled: { label: labels.statusCancelled, variant: "danger" as const },
  }[phase];

  return (
    <li>
      <Link
        href={`/reservations/${reservation.id}`}
        className="flex items-center gap-4 p-4 transition-colors hover:bg-paper"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-display text-lg font-medium text-ink">{hours}</p>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="mt-1 truncate text-sm text-ink-muted">
            {reservation.space.name}, {reservation.location.name}
          </p>
        </div>
        <p
          className={cn(
            "shrink-0 text-sm font-medium tabular-nums",
            // Still spent: red, with a minus. Refunded: crossed out.
            phase === "upcoming" && "text-danger",
            phase === "past" && "text-ink-muted",
            phase === "cancelled" && "text-ink-muted line-through",
          )}
        >
          -{reservation.creditsSpent} {credits}
        </p>
        <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.75} />
      </Link>
    </li>
  );
}
