import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireOnboarded } from "@/lib/auth/session";
import { getLocale, getDictionary } from "@/lib/i18n/locale";
import { dayKey, formatDistance, formatHour } from "@/lib/member/format";
import {
  checkInReasonLabel,
  dayHeaderLabel,
  groupByDay,
} from "@/lib/member/reservations";
import { listCheckIns } from "@/lib/mobile/checkin";

export const metadata: Metadata = {
  title: "Arrivées",
};

// Every attempt of a member fits well under this (the list is not paginated
// on the site; the mobile app pages it 20 at a time).
const LIST_LIMIT = 200;

/** `2026-10-06`, the only shape `<input type="date">` sends. */
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// The trace of every arrival attempt, accepted or refused — the web twin of
// the mobile app's "Historique" tab, read through the same server function.
// The date filter is a plain GET form: it writes `?jour=2026-10-06` in the
// URL and the page filters on the server (`searchParams`), no JavaScript.
export default async function ArrivalsPage({ searchParams }: PageProps<"/arrivees">) {
  const [user, params, locale] = await Promise.all([
    requireOnboarded(),
    searchParams,
    getLocale(),
  ]);
  const t = getDictionary(locale);
  const a = t.member.arrivals;

  const day =
    typeof params.jour === "string" && DAY_PATTERN.test(params.jour) ? params.jour : null;
  const { items } = await listCheckIns(user.id, { limit: LIST_LIMIT });
  const visible = day
    ? items.filter((item) => dayKey(new Date(item.createdAt)) === day)
    : items;

  const now = new Date();
  const sections = groupByDay(visible, (item) => item.createdAt);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-3xl font-medium text-ink">{a.title}</h1>
      <p className="mt-2 text-ink-muted">{a.lead}</p>

      {items.length === 0 ? (
        <EmptyState
          className="mt-8"
          title={a.emptyTitle}
          description={a.emptyBody}
          action={
            <Link href="/reservations" className={buttonVariants({ size: "sm" })}>
              {t.member.nav.reservations}
            </Link>
          }
        />
      ) : (
        <>
          <form
            action="/arrivees"
            method="get"
            className="mt-6 flex flex-wrap items-end gap-3"
          >
            <div className="flex w-44 flex-col gap-1.5">
              <Label htmlFor="jour">{a.filterLabel}</Label>
              <Input
                id="jour"
                name="jour"
                type="date"
                defaultValue={day ?? ""}
                max={dayKey(now)}
                required
              />
            </div>
            <Button type="submit" variant="secondary">
              {a.filterSubmit}
            </Button>
            {day && (
              <Link
                href="/arrivees"
                className="py-2 text-sm text-pine underline-offset-2 hover:underline"
              >
                {a.clear}
              </Link>
            )}
          </form>

          {visible.length === 0 && <p className="mt-8 text-ink-muted">{a.noneForDay}</p>}

          <div className="mt-8 flex flex-col gap-8">
            {sections.map((section) => (
              <section key={section.key}>
                <h2 className="font-display text-lg font-medium text-ink first-letter:uppercase">
                  {dayHeaderLabel(section.date, now, t.member.reservations, locale)}
                </h2>
                <ul className="mt-3 divide-y divide-line overflow-hidden rounded-sm border border-line bg-surface">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/arrivees/${item.id}`}
                        className="flex items-center gap-4 p-4 transition-colors hover:bg-paper"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            {/* The hour the attempt was made, not the slot's. */}
                            <p className="font-display text-lg font-medium text-ink">
                              {formatHour(new Date(item.createdAt), locale)}
                            </p>
                            <Badge variant={item.accepted ? "success" : "danger"}>
                              {item.accepted
                                ? a.accepted
                                : checkInReasonLabel(item.reason, a)}
                            </Badge>
                          </div>
                          <p className="mt-1 truncate text-sm text-ink-muted">
                            {item.reservation.space.name},{" "}
                            {item.reservation.location.name}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm tabular-nums text-ink-muted">
                          {formatDistance(item.distanceM, locale)}
                        </p>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-ink-muted"
                          strokeWidth={1.75}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
