"use client";

import { useActionState, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  BOOKABLE_HOURS,
  defaultBookingDay,
  endHoursFor,
  isRangeBookable,
  isSlotBookable,
  maxBookingDate,
  minBookingDate,
  rangeCost,
  slotRange,
  type BusySlot,
} from "@/lib/booking/slots";
import { useActionToast } from "@/lib/feedback/use-action-toast";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/locale-constants";
import { cn } from "@/lib/utils/cn";
import type { Space } from "@/types/domain";
import { createReservationAction, type ReservationFormState } from "../_actions";
import { MonthCalendar } from "./month-calendar";

const initialState: ReservationFormState = { error: null };

/**
 * Picking a booking in three steps — a day in the month calendar, a start
 * hour, an end hour — next to a summary that always shows what the choice
 * costs. Same steps and same rules as the mobile app (`lib/booking/slots.ts`
 * is its `features/booking/slots.ts`).
 *
 * Client Component because every choice updates the next step at once. The
 * rules themselves are the pure functions of `lib/booking/slots.ts`; this
 * component only holds what was picked. The Server Action checks everything
 * again before writing.
 */
export function BookingPicker({
  space,
  busySlots,
  credits,
  t,
  submitLabel,
  submittingLabel,
  locale,
  preselect = false,
}: {
  space: Pick<Space, "id" | "pricePerHour">;
  /** Confirmed reservations of this space: start and end only. */
  busySlots: BusySlot[];
  credits: number;
  t: Dictionary["bookingFlow"];
  submitLabel: string;
  submittingLabel: string;
  locale: Locale;
  /** Start with the first free hour of the first bookable day already picked. */
  preselect?: boolean;
}) {
  // Read once: the grid must not change under the member's cursor.
  const [now] = useState(() => new Date());
  const [day, setDay] = useState(() => defaultBookingDay(now));
  // With `preselect`, the first hour still free on that day is picked from
  // the start, for one hour — the member only has to confirm or extend it.
  const [startHour, setStartHour] = useState<number | null>(() =>
    preselect
      ? (BOOKABLE_HOURS.find((hour) => isSlotBookable(day, hour, busySlots, now)) ?? null)
      : null,
  );
  const [endHour, setEndHour] = useState<number | null>(() =>
    startHour === null ? null : startHour + 1,
  );
  const [state, formAction, pending] = useActionState(
    createReservationAction,
    initialState,
  );
  useActionToast(state);

  const intlLocale = INTL_LOCALE[locale];
  const formatHour = (hour: number) => (locale === "fr" ? `${hour}h` : `${hour}:00`);

  const isStartFree = (hour: number) => isSlotBookable(day, hour, busySlots, now);
  const isEndFree = (hour: number) =>
    startHour !== null && isRangeBookable(day, startHour, hour, busySlots, now);
  const dayFull = !BOOKABLE_HOURS.some(isStartFree);

  const selectDay = (next: Date) => {
    setDay(next);
    // Hours belong to a day: a new day starts from nothing.
    setStartHour(null);
    setEndHour(null);
  };

  const selectStart = (hour: number) => {
    setStartHour(hour);
    // One hour by default: the member only has to extend it.
    setEndHour(hour + 1);
  };

  const complete = startHour !== null && endHour !== null;
  const range = complete ? slotRange(day, startHour, endHour) : null;
  const cost = complete ? rangeCost(space.pricePerHour, startHour, endHour) : null;
  const missing = cost !== null && cost > credits ? cost - credits : 0;
  const creditsWord = (count: number) => (count === 1 ? t.credit : t.credits);

  return (
    <form
      action={formAction}
      className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start"
    >
      <input type="hidden" name="spaceId" value={space.id} />
      <input type="hidden" name="startAt" value={range?.startAt ?? ""} />
      <input type="hidden" name="endAt" value={range?.endAt ?? ""} />

      <div className="flex flex-col gap-8">
        <fieldset>
          <legend className="font-display text-lg font-medium text-ink">
            1. {t.stepDay}
          </legend>
          <p className="mt-1 text-sm text-ink-muted">{t.horizon}</p>
          <div className="mt-4 max-w-sm">
            <MonthCalendar
              selected={day}
              minDate={minBookingDate(now)}
              maxDate={maxBookingDate(now)}
              today={now}
              onSelect={selectDay}
              intlLocale={intlLocale}
              labels={t}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-lg font-medium text-ink">
            2. {t.stepStart}
          </legend>
          {dayFull ? (
            <p className="mt-3 text-sm text-ink-muted">{t.dayFull}</p>
          ) : (
            <HourGrid
              hours={BOOKABLE_HOURS}
              selected={startHour}
              isFree={isStartFree}
              onSelect={selectStart}
              formatHour={formatHour}
            />
          )}
        </fieldset>

        <fieldset>
          <legend className="font-display text-lg font-medium text-ink">
            3. {t.stepEnd}
          </legend>
          {startHour === null ? (
            <p className="mt-3 text-sm text-ink-muted">{t.pickStartFirst}</p>
          ) : (
            <HourGrid
              hours={endHoursFor(startHour)}
              selected={endHour}
              isFree={isEndFree}
              onSelect={setEndHour}
              formatHour={formatHour}
            />
          )}
        </fieldset>
      </div>

      {/* Stays in view while the steps scroll. `aria-live`: a screen reader
          hears the cost change when an hour is picked. */}
      <aside
        aria-live="polite"
        className="rounded-sm border border-line bg-surface p-6 lg:sticky lg:top-8"
      >
        <h2 className="font-display text-lg font-medium text-ink">{t.summaryTitle}</h2>

        {complete && cost !== null ? (
          <dl className="mt-4 divide-y divide-line text-sm">
            <SummaryRow label={t.day}>
              {upperFirst(
                day.toLocaleDateString(intlLocale, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }),
              )}
            </SummaryRow>
            <SummaryRow label={t.slot}>
              {formatHour(startHour)}–{formatHour(endHour)}
            </SummaryRow>
            <SummaryRow label={t.duration}>{endHour - startHour} h</SummaryRow>
            <SummaryRow label={t.cost}>
              {/* What leaves the balance: red, with a minus, as in the app. */}
              <span className="font-display text-lg font-medium tabular-nums text-danger">
                -{cost} {creditsWord(cost)}
              </span>
            </SummaryRow>
            <SummaryRow label={missing ? t.balance : t.balanceAfter}>
              <span className="tabular-nums">
                {missing ? credits : credits - cost}{" "}
                {creditsWord(missing ? credits : credits - cost)}
              </span>
            </SummaryRow>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-ink-muted">{t.summaryEmpty}</p>
        )}

        {missing > 0 && (
          <Alert variant="error" className="mt-4">
            {t.missing} {missing} {creditsWord(missing)} {t.missingSuffix}
          </Alert>
        )}
        {state.error && (
          <Alert variant="error" className="mt-4">
            {state.error}
          </Alert>
        )}

        <Button
          type="submit"
          disabled={!complete || pending || missing > 0}
          className="mt-5 w-full"
        >
          {pending ? submittingLabel : submitLabel}
        </Button>
      </aside>
    </form>
  );
}

// "vendredi 9 octobre" → "Vendredi 9 octobre". CSS `capitalize` would also
// capitalize the month, which French does not.
function upperFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function HourGrid({
  hours,
  selected,
  isFree,
  onSelect,
  formatHour,
}: {
  hours: number[];
  selected: number | null;
  isFree: (hour: number) => boolean;
  onSelect: (hour: number) => void;
  formatHour: (hour: number) => string;
}) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
      {hours.map((hour) => (
        <button
          key={hour}
          type="button"
          disabled={!isFree(hour)}
          aria-pressed={selected === hour}
          onClick={() => onSelect(hour)}
          className={cn(
            "h-10 rounded-sm border text-sm tabular-nums transition-colors",
            // Taken or past: struck through, so it reads as "not available"
            // rather than as a button that is merely faded.
            "disabled:cursor-not-allowed disabled:border-line disabled:bg-paper disabled:text-ink-muted/50 disabled:line-through",
            selected === hour
              ? "border-pine bg-pine font-medium text-pine-contrast"
              : "border-line bg-surface text-ink enabled:hover:border-pine",
          )}
        >
          {formatHour(hour)}
        </button>
      ))}
    </div>
  );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}
