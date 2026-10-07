import { describe, expect, it, vi } from "vitest";

// `checkin.ts` also holds the functions that write to the database. Only the
// decision rule is tested here, so the two server-side imports are replaced:
// nothing in this file opens a connection.
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({ prisma: {} }));

import { refusalReason } from "./checkin";
import { assertBookableSlot, computeCredits } from "./reservations";

const minutes = (count: number) => count * 60_000;
const startAt = new Date("2026-10-08T12:00:00Z");
const endAt = new Date("2026-10-08T14:00:00Z");
const now = new Date(startAt.getTime() + minutes(5));

/** An arrival that is accepted; each test changes one thing. */
const accepted = {
  status: "confirmed",
  spaceId: "space-1",
  startAt,
  endAt,
  now,
  accuracyM: 20,
  capturedAt: now,
  distanceM: 40,
};

describe("refusalReason (arrival rules)", () => {
  it("accepts an arrival inside the window, close enough, with a fresh position", () => {
    expect(refusalReason(accepted)).toBeNull();
  });

  it("refuses a reservation that is not confirmed", () => {
    expect(refusalReason({ ...accepted, status: "cancelled" })).toBe("NOT_CONFIRMED");
  });

  it("opens 15 minutes before the start, not earlier", () => {
    const early = (count: number) => new Date(startAt.getTime() - minutes(count));
    expect(refusalReason({ ...accepted, now: early(20), capturedAt: early(20) })).toBe(
      "TOO_EARLY",
    );
    expect(
      refusalReason({ ...accepted, now: early(10), capturedAt: early(10) }),
    ).toBeNull();
  });

  it("closes at the end of the slot", () => {
    const late = new Date(endAt.getTime() + minutes(1));
    expect(refusalReason({ ...accepted, now: late, capturedAt: late })).toBe("TOO_LATE");
  });

  it("refuses a position vaguer than 100 m", () => {
    expect(refusalReason({ ...accepted, accuracyM: 100 })).toBeNull();
    expect(refusalReason({ ...accepted, accuracyM: 101 })).toBe("LOW_ACCURACY");
  });

  it("refuses a position older than one minute", () => {
    const old = new Date(now.getTime() - minutes(2));
    expect(refusalReason({ ...accepted, capturedAt: old })).toBe("STALE_POSITION");
  });

  it("refuses beyond 150 m of the location", () => {
    expect(refusalReason({ ...accepted, distanceM: 150 })).toBeNull();
    expect(refusalReason({ ...accepted, distanceM: 151 })).toBe("TOO_FAR");
  });

  it("refuses the QR code of another space, before looking at the distance", () => {
    expect(refusalReason({ ...accepted, scannedSpaceId: "space-1" })).toBeNull();
    expect(
      refusalReason({ ...accepted, scannedSpaceId: "space-2", distanceM: 9_000 }),
    ).toBe("WRONG_SPACE");
  });
});

describe("booking rules shared by the site and the mobile API", () => {
  const hour = (count: number) => new Date(now.getTime() + count * 3_600_000);

  it("costs the hourly price times the duration, rounded", () => {
    expect(computeCredits(18, hour(1), hour(4))).toBe(54);
    expect(computeCredits(9, hour(1), hour(1.5))).toBe(5); // 4.5 rounded
  });

  it("accepts a slot that starts now or later", () => {
    expect(() => assertBookableSlot(hour(1), hour(2), now)).not.toThrow();
  });

  it("refuses a slot in the past", () => {
    expect(() => assertBookableSlot(hour(-2), hour(-1), now)).toThrow(/maintenant/);
  });

  it("refuses a slot more than a month ahead", () => {
    expect(() => assertBookableSlot(hour(24 * 40), hour(24 * 40 + 1), now)).toThrow(
      /un mois/,
    );
  });

  it("refuses a duration under 30 minutes or over 12 hours", () => {
    expect(() => assertBookableSlot(hour(1), hour(1.25), now)).toThrow(/30 minutes/);
    expect(() => assertBookableSlot(hour(1), hour(14), now)).toThrow(/12 heures/);
  });
});
