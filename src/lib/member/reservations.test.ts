import { describe, expect, it } from "vitest";
import { fr } from "@/lib/i18n/dictionaries/fr";
import { joinName, splitName } from "./name";
import {
  attendanceRate,
  cancelBlocker,
  checkInReasonLabel,
  groupByDay,
  reservationPhase,
  startsInLabel,
} from "./reservations";

const now = new Date("2026-10-08T10:00:00Z"); // 12h in Paris
const iso = (hoursFromNow: number) =>
  new Date(now.getTime() + hoursFromNow * 3_600_000).toISOString();

/** The arrival part of a reservation, with only the state that matters here. */
const checkIn = (
  state: "available" | "too_early" | "expired" | "done" | "unavailable",
) => ({
  state,
  opensAt: iso(0),
  closesAt: iso(1),
  doneAt: null,
});

describe("reservationPhase", () => {
  it("is upcoming until the slot has fully ended", () => {
    expect(reservationPhase({ status: "confirmed", endAt: iso(2) }, now)).toBe(
      "upcoming",
    );
    // In progress: started an hour ago, ends in an hour.
    expect(reservationPhase({ status: "confirmed", endAt: iso(1) }, now)).toBe(
      "upcoming",
    );
  });

  it("is past once it has ended", () => {
    expect(reservationPhase({ status: "confirmed", endAt: iso(-1) }, now)).toBe("past");
  });

  it("is cancelled whatever its dates", () => {
    expect(reservationPhase({ status: "cancelled", endAt: iso(2) }, now)).toBe(
      "cancelled",
    );
  });
});

describe("cancelBlocker", () => {
  it("allows cancelling a confirmed reservation that has not started", () => {
    expect(
      cancelBlocker(
        { status: "confirmed", startAt: iso(2), checkIn: checkIn("too_early") },
        now,
      ),
    ).toBeNull();
  });

  it("blocks once the slot has started", () => {
    expect(
      cancelBlocker(
        { status: "confirmed", startAt: iso(-1), checkIn: checkIn("available") },
        now,
      ),
    ).toBe("started");
  });

  it("blocks once the arrival is validated", () => {
    expect(
      cancelBlocker(
        { status: "confirmed", startAt: iso(1), checkIn: checkIn("done") },
        now,
      ),
    ).toBe("arrived");
  });

  it("blocks a reservation that is no longer confirmed", () => {
    expect(
      cancelBlocker(
        { status: "cancelled", startAt: iso(2), checkIn: checkIn("unavailable") },
        now,
      ),
    ).toBe("inactive");
  });
});

describe("groupByDay", () => {
  it("makes one section per day and keeps the order", () => {
    const items = [iso(0), iso(1), iso(30), iso(31), iso(80)];
    const sections = groupByDay(items, (item) => item);
    expect(sections.map((section) => section.items.length)).toEqual([2, 2, 1]);
    expect(sections[0].key).toBe("2026-10-08");
  });

  it("returns nothing for an empty list", () => {
    expect(groupByDay([], (item: string) => item)).toEqual([]);
  });
});

describe("labels", () => {
  const t = fr.member.home;

  it("says how far away a reservation is", () => {
    expect(startsInLabel({ startAt: iso(-1), endAt: iso(1) }, now, t)).toBe(t.inProgress);
    expect(startsInLabel({ startAt: iso(26), endAt: iso(27) }, now, t)).toBe(t.tomorrow);
    expect(startsInLabel({ startAt: iso(3), endAt: iso(4) }, now, t)).toContain("3");
  });

  it("names a refusal, and falls back for an unknown code", () => {
    const arrivals = fr.member.arrivals;
    expect(checkInReasonLabel("TOO_FAR", arrivals)).toBe(arrivals.reasons.TOO_FAR);
    expect(checkInReasonLabel("SOMETHING_NEW", arrivals)).toBe(arrivals.reasons.OTHER);
    expect(checkInReasonLabel(null, arrivals)).toBe(arrivals.reasons.OTHER);
  });
});

describe("attendanceRate", () => {
  it("is the share of finished bookings with a validated arrival", () => {
    expect(attendanceRate({ past: 4, attended: 3 })).toBe(75);
  });

  it("is null when no booking is finished yet", () => {
    expect(attendanceRate({ past: 0, attended: 0 })).toBeNull();
  });
});

describe("first name and last name", () => {
  it("splits on the first space", () => {
    expect(splitName("Camille Roussel")).toEqual({
      firstName: "Camille",
      lastName: "Roussel",
    });
    expect(splitName("Jean de La Fontaine").lastName).toBe("de La Fontaine");
    expect(splitName("Camille")).toEqual({ firstName: "Camille", lastName: "" });
  });

  it("joins them back into the single stored name", () => {
    expect(joinName(" Camille ", " Roussel ")).toBe("Camille Roussel");
    expect(joinName("Camille", "")).toBe("Camille");
  });
});
