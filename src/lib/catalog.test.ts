import { describe, expect, it } from "vitest";
import {
  filterLocations,
  formatPriceRange,
  isSpaceType,
  listCities,
  priceRange,
  summarizeLocation,
} from "./catalog";
import type { Location, Space } from "@/types/domain";

function location(id: string, city: string): Location {
  return {
    id,
    slug: id,
    name: id,
    city,
    address: "",
    lat: 0,
    lng: 0,
    description: "",
    amenities: [],
  };
}

function space(
  locationId: string,
  type: Space["type"],
  pricePerHour: number,
  status: Space["status"] = "active",
): Space {
  return {
    id: `${locationId}-${type}`,
    locationId,
    name: type,
    type,
    capacity: 1,
    pricePerHour,
    status,
  };
}

const lyon = location("lyon", "Lyon");
const lille = location("lille", "Lille");
const spaces = [
  space("lyon", "salle-reunion", 18),
  space("lyon", "poste-flex", 4),
  space("lyon", "bureau-prive", 9, "maintenance"),
  space("lille", "bureau-prive", 8),
];

describe("cities and prices", () => {
  it("lists each city once, in alphabetical order", () => {
    expect(listCities([lyon, lille, location("lyon-2", "Lyon")])).toEqual([
      "Lille",
      "Lyon",
    ]);
  });

  it("gives the lowest and highest price, or null without any space", () => {
    expect(priceRange(spaces)).toEqual({ min: 4, max: 18 });
    expect(priceRange([])).toBeNull();
  });

  it("writes a single price when both ends are equal", () => {
    expect(formatPriceRange({ min: 4, max: 4 })).toBe("4");
    expect(formatPriceRange({ min: 8, max: 9 })).toBe("8 à 9");
  });

  it("recognises a space type and rejects anything else", () => {
    expect(isSpaceType("phone-booth")).toBe(true);
    expect(isSpaceType("piscine")).toBe(false);
    expect(isSpaceType(undefined)).toBe(false);
  });
});

describe("summarizeLocation", () => {
  const summary = summarizeLocation(lyon, spaces);

  it("keeps only the bookable spaces of this location", () => {
    expect(summary.spaces.map((item) => item.type)).toEqual([
      "salle-reunion",
      "poste-flex",
    ]);
  });

  it("lists its types in display order and its lowest price", () => {
    expect(summary.types).toEqual(["poste-flex", "salle-reunion"]);
    expect(summary.fromPrice).toBe(4);
  });

  it("has no price when the location has no bookable space", () => {
    expect(summarizeLocation(location("vide", "Paris"), spaces).fromPrice).toBeNull();
  });
});

describe("filterLocations", () => {
  const summaries = [lyon, lille].map((item) => summarizeLocation(item, spaces));

  it("filters by city, by type, or by both", () => {
    expect(filterLocations(summaries, { city: "Lille" })).toHaveLength(1);
    expect(filterLocations(summaries, { type: "poste-flex" })[0].location.id).toBe(
      "lyon",
    );
    expect(filterLocations(summaries, { city: "Lille", type: "poste-flex" })).toEqual([]);
  });

  it("ignores a type that is only offered by a space in maintenance", () => {
    expect(filterLocations(summaries, { city: "Lyon", type: "bureau-prive" })).toEqual(
      [],
    );
  });

  it("returns everything without a filter", () => {
    expect(filterLocations(summaries, {})).toHaveLength(2);
  });
});
