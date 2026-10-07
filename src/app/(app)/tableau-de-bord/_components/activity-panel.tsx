import type { ReactNode } from "react";
import { BadgeCheck, CalendarDays, Clock, Coins, MapPin } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { Locale } from "@/lib/i18n/locale-constants";
import { fill, formatNumber } from "@/lib/member/format";
import { attendanceRate, type MemberSummary } from "@/lib/member/reservations";

// The member's figures as one sheet ruled by hairlines — the balance on top,
// four figures under it, the favourite place as a footer — rather than six
// separate cards: the numbers belong together and read as one statement.
// Every figure is counted by the server (`getMemberSummary`), the same ones
// the mobile app shows.
export function ActivityPanel({
  credits,
  summary,
  locale,
  t,
  nav,
}: {
  credits: number;
  summary: MemberSummary;
  locale: Locale;
  t: Dictionary["member"]["home"];
  nav: Dictionary["member"]["nav"];
}) {
  const rate = attendanceRate(summary.attendance);
  const period = fill(t.lastDays, { n: summary.windowDays });

  return (
    <div className="overflow-hidden rounded-sm border border-line bg-surface">
      <div className="p-5">
        <p className="text-sm text-ink-muted">{nav.balance}</p>
        <p className="mt-1 text-ink-muted">
          <span className="font-display text-5xl font-medium tabular-nums text-ink">
            {credits}
          </span>{" "}
          {credits === 1 ? nav.credit : nav.credits}
        </p>
      </div>

      <dl className="grid grid-cols-2 border-t border-line">
        <Figure
          icon={<CalendarDays className="h-4 w-4" strokeWidth={1.75} />}
          label={t.upcoming}
          value={String(summary.upcoming.count)}
          caption={summary.upcoming.count === 1 ? t.bookingOne : t.bookingMany}
        />
        <Figure
          icon={<Clock className="h-4 w-4" strokeWidth={1.75} />}
          label={t.hours}
          value={`${formatNumber(summary.recent.hours, locale)} h`}
          caption={period}
          className="border-l border-line"
        />
        <Figure
          icon={<Coins className="h-4 w-4" strokeWidth={1.75} />}
          label={t.spent}
          value={String(summary.recent.creditsSpent)}
          caption={period}
          className="border-t border-line"
        />
        <Figure
          icon={<BadgeCheck className="h-4 w-4" strokeWidth={1.75} />}
          label={t.presence}
          value={rate === null ? "—" : `${rate} %`}
          caption={
            rate === null
              ? t.presenceNone
              : fill(t.presenceDetail, {
                  a: summary.attendance.attended,
                  b: summary.attendance.past,
                })
          }
          className="border-l border-t border-line"
        >
          {/* The only figure that is a proportion: a bar says it at a glance. */}
          {rate !== null && (
            <div
              aria-hidden="true"
              className="my-1.5 h-1 overflow-hidden rounded-full bg-line"
            >
              <div
                className="h-full rounded-full bg-pine"
                style={{ width: `${rate}%` }}
              />
            </div>
          )}
        </Figure>
      </dl>

      {summary.favoriteLocation && (
        <div className="flex items-center gap-3 border-t border-line p-5">
          <MapPin className="h-4 w-4 shrink-0 text-pine" strokeWidth={1.75} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink-muted">{t.favorite}</p>
            <p className="truncate font-medium text-ink">
              {summary.favoriteLocation.name}, {summary.favoriteLocation.city}
            </p>
          </div>
          <p className="shrink-0 text-sm text-ink-muted">
            {summary.favoriteLocation.visits}{" "}
            {summary.favoriteLocation.visits === 1 ? t.visitOne : t.visitMany}
          </p>
        </div>
      )}
    </div>
  );
}

function Figure({
  icon,
  label,
  value,
  caption,
  className,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  caption: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`p-5 ${className ?? ""}`}>
      <dt className="flex items-center gap-2 text-sm text-ink-muted">
        {icon}
        {label}
      </dt>
      <dd>
        <p className="mt-1 font-display text-3xl font-medium tabular-nums text-ink">
          {value}
        </p>
        {children}
        <p className="text-xs text-ink-muted">{caption}</p>
      </dd>
    </div>
  );
}
