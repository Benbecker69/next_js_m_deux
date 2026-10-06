"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  buildMonthGrid,
  isSameDay,
  startOfMonth,
} from "@/lib/booking/calendar";
import { cn } from "@/lib/utils/cn";

/**
 * A month grid for picking one day. Presentational: it knows nothing about
 * bookings — the range of days that can be picked comes from the parent
 * (`minDate`/`maxDate`), as does the selected day. The only state it owns is
 * which month is on screen.
 */
export function MonthCalendar({
  selected,
  minDate,
  maxDate,
  today,
  onSelect,
  intlLocale,
  labels,
}: {
  selected: Date;
  minDate: Date;
  maxDate: Date;
  today: Date;
  onSelect: (day: Date) => void;
  /** "fr-FR" or "en-GB": how the month title and the day labels are written. */
  intlLocale: string;
  labels: { weekdays: string[]; prevMonth: string; nextMonth: string };
}) {
  const [month, setMonth] = useState(() => startOfMonth(selected));
  const weeks = buildMonthGrid(month);

  // No point paging to a month where nothing can be picked.
  const canGoBack = month > startOfMonth(minDate);
  const canGoForward = month < startOfMonth(maxDate);

  const title = month.toLocaleDateString(intlLocale, { month: "long", year: "numeric" });

  return (
    <div className="rounded-sm border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label={labels.prevMonth}
          disabled={!canGoBack}
          onClick={() => setMonth(addMonths(month, -1))}
          className="flex h-9 w-9 items-center justify-center rounded-sm text-ink transition-colors hover:bg-paper disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        {/* Announced when the month changes. */}
        <p
          aria-live="polite"
          className="font-display text-lg font-medium capitalize text-ink"
        >
          {title}
        </p>
        <button
          type="button"
          aria-label={labels.nextMonth}
          disabled={!canGoForward}
          onClick={() => setMonth(addMonths(month, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-sm text-ink transition-colors hover:bg-paper disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 text-center text-xs text-ink-muted">
        {labels.weekdays.map((weekday) => (
          <span key={weekday} className="py-2">
            {weekday}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {weeks.flat().map((day, index) => {
          if (!day) return <span key={`blank-${index}`} />;

          const disabled = day < minDate || day > maxDate;
          const isSelected = isSameDay(day, selected);
          const isToday = isSameDay(day, today);
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={day.toLocaleDateString(intlLocale, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              onClick={() => onSelect(day)}
              className={cn(
                "mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm tabular-nums transition-colors",
                "disabled:cursor-not-allowed disabled:text-ink-muted/40",
                isSelected
                  ? "bg-pine font-medium text-pine-contrast"
                  : "text-ink enabled:hover:bg-pine/10",
                // Today is ringed even when another day is selected.
                isToday && !isSelected ? "ring-1 ring-inset ring-pine" : undefined,
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
