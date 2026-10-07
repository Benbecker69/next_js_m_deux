// What the booking map shows. Plain data and pure functions, shared by the
// Server Components that build the pins and the Client Component that draws
// them — the same ideas as the mobile app's `features/spaces/map.ts`.

/** One pin: a location, and a short line about it. */
export type MapPin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Shown in the pin's tooltip, under the name. */
  caption?: string;
};

export type MapPoint = { lat: number; lng: number };

// Cities with nothing to do with the locations Repère lists: the locked map
// is centred on one of them, so it looks like a real map without giving away
// where the real locations are.
const DECOY_CITIES: MapPoint[] = [
  { lat: 48.8566, lng: 2.3522 }, // Paris
  { lat: 43.2965, lng: 5.3698 }, // Marseille
  { lat: 43.6047, lng: 1.4442 }, // Toulouse
  { lat: 48.5734, lng: 7.7521 }, // Strasbourg
  { lat: 43.7102, lng: 7.262 }, // Nice
  { lat: 48.1173, lng: -1.6778 }, // Rennes
  { lat: 43.6108, lng: 3.8767 }, // Montpellier
  { lat: 47.2184, lng: 6.0241 }, // Besançon
];

/**
 * A made-up centre for the locked map, picked at random. `random` is
 * injectable (like a clock) so the pick can be reasoned about; in the app it
 * is `Math.random`.
 */
export function randomDecoyPoint(random: () => number = Math.random): MapPoint {
  const index = Math.min(
    Math.floor(random() * DECOY_CITIES.length),
    DECOY_CITIES.length - 1,
  );
  return DECOY_CITIES[index];
}

/** Opens the route to a place in the visitor's own maps app or site. */
export function directionsUrl(point: MapPoint): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;
}
