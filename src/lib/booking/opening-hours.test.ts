import { describe, expect, it } from "vitest";
import { isWithinOpeningHours } from "./opening-hours";

// Instants are written in UTC on purpose: the rule must give the same answer
// on a server running in UTC (the Docker image) as on a machine in France.
// In October Paris is UTC+2; in December it is UTC+1.
const at = (iso: string) => new Date(iso);

describe("isWithinOpeningHours", () => {
  it("accepts a whole-hour booking between 9h and 18h, Paris time", () => {
    // 9h → 18h in Paris, summer time.
    expect(
      isWithinOpeningHours(at("2026-10-08T07:00:00Z"), at("2026-10-08T16:00:00Z")),
    ).toBe(true);
    // 14h → 15h.
    expect(
      isWithinOpeningHours(at("2026-10-08T12:00:00Z"), at("2026-10-08T13:00:00Z")),
    ).toBe(true);
  });

  it("follows the change to winter time", () => {
    // 9h → 10h in Paris, winter time.
    expect(
      isWithinOpeningHours(at("2026-12-01T08:00:00Z"), at("2026-12-01T09:00:00Z")),
    ).toBe(true);
    // The same UTC hours as the summer case would be 8h in winter: refused.
    expect(
      isWithinOpeningHours(at("2026-12-01T07:00:00Z"), at("2026-12-01T09:00:00Z")),
    ).toBe(false);
  });

  it("refuses a booking that starts before the opening", () => {
    // 8h → 10h in Paris.
    expect(
      isWithinOpeningHours(at("2026-10-08T06:00:00Z"), at("2026-10-08T08:00:00Z")),
    ).toBe(false);
  });

  it("refuses a booking that ends after the closing", () => {
    // 17h → 19h in Paris.
    expect(
      isWithinOpeningHours(at("2026-10-08T15:00:00Z"), at("2026-10-08T17:00:00Z")),
    ).toBe(false);
  });

  it("refuses a booking that is not on the hour", () => {
    expect(
      isWithinOpeningHours(at("2026-10-08T07:30:00Z"), at("2026-10-08T09:00:00Z")),
    ).toBe(false);
    expect(
      isWithinOpeningHours(at("2026-10-08T07:00:00Z"), at("2026-10-08T08:15:00Z")),
    ).toBe(false);
  });

  it("refuses a booking that spans two days", () => {
    // 17h one day → 10h the next.
    expect(
      isWithinOpeningHours(at("2026-10-08T15:00:00Z"), at("2026-10-09T08:00:00Z")),
    ).toBe(false);
  });

  it("refuses an end that is not after the start", () => {
    expect(
      isWithinOpeningHours(at("2026-10-08T09:00:00Z"), at("2026-10-08T09:00:00Z")),
    ).toBe(false);
  });
});
