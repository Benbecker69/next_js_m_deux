import { describe, expect, it } from "vitest";
import {
  BOOKABLE_HOURS,
  defaultBookingDay,
  endHoursFor,
  isRangeBookable,
  isSlotPast,
  isSlotTaken,
  maxBookingDate,
  rangeCost,
  slotRange,
  slotStart,
} from "./slots";

// Dates are built in local time, like the picker does, so these tests give
// the same result whatever the machine's time zone.
const day = new Date(2026, 9, 12); // Monday 12 October 2026
const morning = new Date(2026, 9, 12, 8, 0); // before the first slot

/** A reservation already taken on `day`, from `startHour` to `endHour`. */
function busy(startHour: number, endHour: number) {
  return slotRange(day, startHour, endHour);
}

describe("bookable hours", () => {
  it("a booking can start from 9h to 17h", () => {
    expect(BOOKABLE_HOURS).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });

  it("offers every end hour after the start, up to 18h", () => {
    expect(endHoursFor(15)).toEqual([16, 17, 18]);
    expect(endHoursFor(17)).toEqual([18]);
  });
});

describe("booking horizon", () => {
  it("ends on the same date one month later", () => {
    const last = maxBookingDate(new Date(2026, 8, 28, 10, 0)); // 28 September
    expect([last.getFullYear(), last.getMonth(), last.getDate()]).toEqual([2026, 9, 28]);
  });

  it("stops at the last day of a shorter month", () => {
    const last = maxBookingDate(new Date(2027, 0, 31, 10, 0)); // 31 January
    expect([last.getMonth(), last.getDate()]).toEqual([1, 28]); // 28 February
  });

  it("opens on today while a slot can still start, on tomorrow after 17h", () => {
    expect(defaultBookingDay(new Date(2026, 9, 12, 16, 30)).getDate()).toBe(12);
    expect(defaultBookingDay(new Date(2026, 9, 12, 17, 30)).getDate()).toBe(13);
  });
});

describe("slot availability", () => {
  it("a slot is past as soon as it has started", () => {
    const now = new Date(2026, 9, 12, 14, 40);
    expect(isSlotPast(day, 14, now)).toBe(true);
    expect(isSlotPast(day, 15, now)).toBe(false);
  });

  it("a slot is taken when a reservation overlaps it", () => {
    const taken = [busy(10, 12)];
    expect(isSlotTaken(day, 10, taken)).toBe(true);
    expect(isSlotTaken(day, 11, taken)).toBe(true);
  });

  it("a reservation that ends at 12h leaves the 12h slot free", () => {
    const taken = [busy(10, 12)];
    expect(isSlotTaken(day, 9, taken)).toBe(false);
    expect(isSlotTaken(day, 12, taken)).toBe(false);
  });

  it("a range is bookable only if every hour in it is free", () => {
    const taken = [busy(11, 12)];
    expect(isRangeBookable(day, 9, 11, taken, morning)).toBe(true);
    expect(isRangeBookable(day, 9, 12, taken, morning)).toBe(false);
    expect(isRangeBookable(day, 12, 14, taken, morning)).toBe(true);
  });

  it("refuses a range outside the opening hours or that ends before it starts", () => {
    expect(isRangeBookable(day, 8, 10, [], morning)).toBe(false);
    expect(isRangeBookable(day, 17, 19, [], morning)).toBe(false);
    expect(isRangeBookable(day, 14, 14, [], morning)).toBe(false);
  });
});

describe("cost and range", () => {
  it("costs the hourly price times the number of hours", () => {
    expect(rangeCost(18, 14, 17)).toBe(54);
    expect(rangeCost(4, 9, 10)).toBe(4);
  });

  it("sends the range as two ISO instants", () => {
    const range = slotRange(day, 14, 16);
    expect(range.startAt).toBe(slotStart(day, 14).toISOString());
    expect(new Date(range.endAt).getTime() - new Date(range.startAt).getTime()).toBe(
      2 * 3_600_000,
    );
  });
});
