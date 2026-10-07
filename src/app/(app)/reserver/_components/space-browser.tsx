"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LocateFixed, MapPin, Users } from "lucide-react";
import { PlacesMap } from "@/components/places-map";
import { SpacePhoto } from "@/components/space-photo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { SPACE_TYPES } from "@/lib/catalog";
import { distanceKm } from "@/lib/geo/distance";
import type { MapPin as Pin } from "@/lib/geo/map";
import { useToast } from "@/lib/feedback/toast-provider";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { fill } from "@/lib/member/format";
import { SPACE_TYPE_LABELS, type Location, type Space } from "@/types/domain";

type SpaceWithLocation = Space & {
  location: Location;
  /** Taken for the coming hour — worked out by the server. */
  busy: boolean;
};

// Client Component because it needs browser-only things a server can't
// provide: filtering as you type, the Geolocation API for "sort by
// distance", and the map. The first filters can come from the URL
// (`/reserver?lieu=…&type=…`, read by the page), which is how a location
// page sends a member straight to its spaces.
export function SpaceBrowser({
  spaces,
  locations,
  initialLocationId = "",
  initialType = "",
  t,
  f,
  m,
}: {
  spaces: SpaceWithLocation[];
  locations: Location[];
  initialLocationId?: string;
  initialType?: string;
  /** Geolocation and sorting labels (`booking`). */
  t: Dictionary["booking"];
  /** Filters and cards (`bookingFlow`). */
  f: Dictionary["bookingFlow"];
  /** Availability and map (`member.booking`). */
  m: Dictionary["member"]["booking"];
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState(initialType);
  const [locationId, setLocationId] = useState(initialLocationId);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const { showSuccess, showError } = useToast();

  const failLocating = (message: string) => {
    setGeoError(message);
    showError(message, t.geoErrorTitle);
    setLocating(false);
  };

  const findNearMe = () => {
    if (!("geolocation" in navigator)) {
      failLocating(t.geoUnavailable);
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
        showSuccess(t.geoSuccess);
      },
      // The browser says which of three things went wrong: each one calls
      // for a different fix, so each one gets its own sentence.
      (error) => {
        if (error.code === error.PERMISSION_DENIED) failLocating(t.geoDenied);
        else if (error.code === error.TIMEOUT) failLocating(t.geoTimeout);
        else failLocating(t.geoPositionUnavailable);
      },
      { timeout: 8000 },
    );
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = spaces.filter(
      (space) =>
        (!type || space.type === type) &&
        (!locationId || space.locationId === locationId) &&
        (!q ||
          space.name.toLowerCase().includes(q) ||
          space.location.city.toLowerCase().includes(q) ||
          space.location.name.toLowerCase().includes(q)),
    );
    if (origin) {
      result = [...result].sort(
        (a, b) => distanceKm(origin, a.location) - distanceKm(origin, b.location),
      );
    }
    return result;
  }, [spaces, query, type, locationId, origin]);

  // One pin per location that has spaces, with how many are free right now.
  const pins = useMemo<Pin[]>(
    () =>
      locations.flatMap((location) => {
        const own = spaces.filter((space) => space.locationId === location.id);
        if (own.length === 0) return [];
        return [
          {
            id: location.id,
            name: location.name,
            lat: location.lat,
            lng: location.lng,
            caption: fill(m.freeOf, {
              a: own.filter((space) => !space.busy).length,
              b: own.length,
            }),
          },
        ];
      }),
    [locations, spaces, m.freeOf],
  );

  const filtering = Boolean(query || type || locationId);
  const reset = () => {
    setQuery("");
    setType("");
    setLocationId("");
  };

  return (
    <div>
      <div className="grid gap-4 rounded-sm border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="space-search">{f.searchLabel}</Label>
          <Input
            id="space-search"
            type="search"
            placeholder={f.searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="space-type">{f.typeLabel}</Label>
          <Select
            id="space-type"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="">{f.allTypes}</option>
            {SPACE_TYPES.map((item) => (
              <option key={item} value={item}>
                {SPACE_TYPE_LABELS[item]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="space-location">{f.locationLabel}</Label>
          <Select
            id="space-location"
            value={locationId}
            onChange={(event) => setLocationId(event.target.value)}
          >
            <option value="">{f.allLocations}</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} — {location.city}
              </option>
            ))}
          </Select>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={findNearMe}
          disabled={locating}
        >
          <LocateFixed className="h-4 w-4" strokeWidth={1.75} />
          {locating ? t.locating : origin ? t.sortedByDistance : t.sortByDistance}
        </Button>
      </div>
      {geoError && (
        <Alert variant="error" className="mt-3">
          {geoError}
        </Alert>
      )}

      {/* The map and the "Lieu" select are two views of one filter: a click
          on a pin chooses that location, a second click lets go of it. */}
      <div className="mt-6">
        <PlacesMap
          pins={pins}
          selectedId={locationId || null}
          onSelect={(id) => setLocationId((current) => (current === id ? "" : id))}
          heightClass="h-72"
          labels={{
            label: m.mapLabel,
            locked: m.mapLocked,
            denied: m.mapDenied,
            enable: m.mapEnable,
          }}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-ink-muted" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? f.countOne : f.countMany}
          {origin ? ` · ${f.nearest}` : ""}
        </p>
        {filtering && (
          <button
            type="button"
            onClick={reset}
            className="text-sm text-pine underline-offset-2 hover:underline"
          >
            {f.reset}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-4"
          title={f.emptyTitle}
          description={f.emptyBody}
          action={
            <Button type="button" size="sm" onClick={reset}>
              {f.reset}
            </Button>
          }
        />
      ) : (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((space) => (
            <li key={space.id}>
              <Link
                href={`/reserver/${space.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-sm border border-line bg-surface transition-colors duration-150 hover:border-pine"
              >
                <SpacePhoto
                  type={space.type}
                  variant="cover"
                  sizes="(min-width: 1024px) 20rem, (min-width: 640px) 50vw, 100vw"
                />
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg font-medium text-ink">
                      {space.name}
                    </h2>
                    {/* Free right now, or taken for the coming hour — it can
                        still be booked for later either way. */}
                    <Badge
                      variant={space.busy ? "warning" : "success"}
                      className="shrink-0"
                    >
                      {space.busy ? m.busyNow : m.freeNow}
                    </Badge>
                  </div>
                  {space.name !== SPACE_TYPE_LABELS[space.type] && (
                    <p className="text-sm text-ink-muted">
                      {SPACE_TYPE_LABELS[space.type]}
                    </p>
                  )}
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-muted">
                    <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">
                      {space.location.name}, {space.location.city}
                      {origin
                        ? ` · ${distanceKm(origin, space.location).toFixed(1)} km`
                        : ""}
                    </span>
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
                    <Users className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                    {space.capacity} {f.capacity}
                  </p>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <p className="text-sm text-ink-muted">
                      <span className="font-display text-xl font-medium tabular-nums text-ink">
                        {space.pricePerHour}
                      </span>{" "}
                      {f.perHour}
                    </p>
                    <span className="text-sm font-medium text-pine group-hover:underline">
                      {f.choose}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
