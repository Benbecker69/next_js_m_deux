"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { distanceKm } from "@/lib/geo/distance";
import { SPACE_TYPE_LABELS, type Location, type Space } from "@/types/domain";

type SpaceWithLocation = Space & { location: Location };

// Client Component because it needs two browser-only things a server can't
// provide: live text filtering as you type, and the Geolocation API for
// "trier par distance" — both are pure front-end, no server round-trip.
export function SpaceBrowser({ spaces }: { spaces: SpaceWithLocation[] }) {
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const findNearMe = () => {
    if (!("geolocation" in navigator)) {
      setGeoError("La géolocalisation n'est pas disponible sur ce navigateur.");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
      },
      () => {
        setGeoError("Localisation refusée ou indisponible.");
        setLocating(false);
      },
      { timeout: 8000 },
    );
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = spaces;
    if (q) {
      result = result.filter(
        (space) =>
          space.location.city.toLowerCase().includes(q) ||
          space.location.name.toLowerCase().includes(q) ||
          SPACE_TYPE_LABELS[space.type].toLowerCase().includes(q),
      );
    }
    if (origin) {
      result = [...result].sort(
        (a, b) => distanceKm(origin, a.location) - distanceKm(origin, b.location),
      );
    }
    return result;
  }, [spaces, query, origin]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Filtrer par ville, lieu ou type d'espace…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="sm:max-w-xs"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={findNearMe}
          disabled={locating}
        >
          {locating
            ? "Localisation…"
            : origin
              ? "Trié par distance"
              : "Trier par distance"}
        </Button>
      </div>
      {geoError && (
        <Alert variant="error" className="mt-2">
          {geoError}
        </Alert>
      )}

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-ink-muted">
          Aucun espace ne correspond à cette recherche.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-t border-line">
          {filtered.map((space) => (
            <li key={space.id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm text-ink">
                  {space.name !== SPACE_TYPE_LABELS[space.type] ? (
                    <>
                      {space.name}{" "}
                      <span className="text-ink-muted">
                        · {SPACE_TYPE_LABELS[space.type]}
                      </span>
                    </>
                  ) : (
                    space.name
                  )}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {space.location.name} — {space.location.city}
                  {origin ? ` · ${distanceKm(origin, space.location).toFixed(1)} km` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="neutral">{space.pricePerHour} crédits/h</Badge>
                <Link
                  href={`/reserver/${space.id}`}
                  className={buttonVariants({ size: "sm" })}
                >
                  Réserver
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
