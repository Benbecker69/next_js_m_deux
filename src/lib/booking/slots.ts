import { addMonths, endOfMonth, startOfDay, startOfMonth } from "./calendar";

// The booking rules — which days and hours can be picked, what a booking
// costs. Pure functions, mirrored from the mobile app's
// `features/booking/slots.ts` so the site and the app agree on what
// "available" means. They only decide what the picker *offers*: the Server
// Action checks again before writing anything.

/** A period already taken on a space: only its start and end leave the server. */
export type BusySlot = { startAt: string; endAt: string };

export const OPENING_HOUR = 9;
export const CLOSING_HOUR = 18; // a booking ends at 18:00 at the latest
/** A booking can start from today up to the same day one month later. */
export const BOOKING_HORIZON_MONTHS = 1;

/** Hours a booking can start at: 9h … 17h. */
export const BOOKABLE_HOURS: number[] = Array.from(
  { length: CLOSING_HOUR - OPENING_HOUR },
  (_, i) => OPENING_HOUR + i,
);

/** Hours a booking that starts at `startHour` can end at: `startHour + 1` … 18h. */
export function endHoursFor(startHour: number): number[] {
  return Array.from({ length: CLOSING_HOUR - startHour }, (_, i) => startHour + 1 + i);
}

export function slotStart(day: Date, hour: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0, 0);
}

export function minBookingDate(now: Date): Date {
  return startOfDay(now);
}

/** Last bookable day: today's date one month later (28 Sept → 28 Oct, 31 Jan → 28 Feb). */
export function maxBookingDate(now: Date): Date {
  const targetMonth = addMonths(startOfMonth(now), BOOKING_HORIZON_MONTHS);
  const lastDayOfTargetMonth = endOfMonth(targetMonth).getDate();
  const day = Math.min(now.getDate(), lastDayOfTargetMonth);
  return new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth(),
    day,
    23,
    59,
    59,
    999,
  );
}

/** Today while a slot can still start today, tomorrow once the last one has. */
export function defaultBookingDay(now: Date): Date {
  const today = startOfDay(now);
  const lastStartToday = slotStart(today, CLOSING_HOUR - 1);
  if (lastStartToday.getTime() >= now.getTime()) return today;
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
}

/** At 14:40 the 14h slot is over, even though it ends at 15h. */
export function isSlotPast(day: Date, hour: number, now: Date): boolean {
  return slotStart(day, hour).getTime() < now.getTime();
}

export function isSlotTaken(day: Date, hour: number, busySlots: BusySlot[]): boolean {
  const start = slotStart(day, hour).getTime();
  const end = slotStart(day, hour + 1).getTime();
  return busySlots.some(
    (slot) =>
      start < new Date(slot.endAt).getTime() && end > new Date(slot.startAt).getTime(),
  );
}

/** One-hour slot: not started yet and not overlapped by a confirmed reservation. */
export function isSlotBookable(
  day: Date,
  hour: number,
  busySlots: BusySlot[],
  now: Date,
): boolean {
  return !isSlotPast(day, hour, now) && !isSlotTaken(day, hour, busySlots);
}

/** A `startHour`→`endHour` booking: inside business hours, and every hour in it bookable. */
export function isRangeBookable(
  day: Date,
  startHour: number,
  endHour: number,
  busySlots: BusySlot[],
  now: Date,
): boolean {
  if (startHour < OPENING_HOUR || endHour > CLOSING_HOUR || endHour <= startHour) {
    return false;
  }
  for (let hour = startHour; hour < endHour; hour++) {
    if (!isSlotBookable(day, hour, busySlots, now)) return false;
  }
  return true;
}

/** The booking as the ISO strings the Server Action expects. */
export function slotRange(
  day: Date,
  startHour: number,
  endHour: number,
): { startAt: string; endAt: string } {
  return {
    startAt: slotStart(day, startHour).toISOString(),
    endAt: slotStart(day, endHour).toISOString(),
  };
}

/** Same formula as the Server Action: price per hour × hours, rounded. */
export function rangeCost(
  pricePerHour: number,
  startHour: number,
  endHour: number,
): number {
  return Math.round(pricePerHour * (endHour - startHour));
}
