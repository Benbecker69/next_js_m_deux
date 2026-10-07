import { describe, expect, it } from "vitest";
import { addMonths, buildMonthGrid, isSameDay, startOfMonth } from "./calendar";

describe("buildMonthGrid", () => {
  // October 2026 starts on a Thursday and has 31 days.
  const weeks = buildMonthGrid(new Date(2026, 9, 1));

  it("gives full weeks of seven cells", () => {
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks).toHaveLength(5);
  });

  it("starts the week on Monday: three blanks before Thursday the 1st", () => {
    const firstWeek = weeks[0];
    expect(firstWeek.slice(0, 3)).toEqual([null, null, null]);
    expect(firstWeek[3]?.getDate()).toBe(1);
  });

  it("contains every day of the month once", () => {
    const days = weeks.flat().filter((cell) => cell !== null);
    expect(days.map((date) => date.getDate())).toEqual(
      Array.from({ length: 31 }, (_, index) => index + 1),
    );
  });
});

describe("month helpers", () => {
  it("moves to the first day of another month, across a year", () => {
    const next = addMonths(new Date(2026, 11, 15), 1); // December → January
    expect([next.getFullYear(), next.getMonth(), next.getDate()]).toEqual([2027, 0, 1]);
  });

  it("finds the first day of a month", () => {
    expect(startOfMonth(new Date(2026, 9, 28, 16, 30)).getDate()).toBe(1);
  });

  it("compares days, not instants", () => {
    expect(isSameDay(new Date(2026, 9, 7, 9), new Date(2026, 9, 7, 18))).toBe(true);
    expect(isSameDay(new Date(2026, 9, 7, 9), new Date(2026, 9, 8, 9))).toBe(false);
  });
});
