"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import { LocateOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { randomDecoyPoint, type MapPin, type MapPoint } from "@/lib/geo/map";
import { useGeoPermission } from "@/lib/geo/use-geo-permission";
import { cn } from "@/lib/utils/cn";

type Leaflet = typeof import("leaflet");

export type PlacesMapLabels = {
  /** Accessible name of the map. */
  label: string;
  locked: string;
  denied: string;
  enable: string;
};

/**
 * The map of the locations — shown only when the visitor's location is on,
 * exactly like in the mobile app. Until then a grayscale map of a random
 * city stands in its place, untouchable, with a message saying what to do.
 *
 * Client Component: a map lives in the browser (Leaflet draws into a DOM
 * node), and the permission is the browser's to tell.
 */
export function PlacesMap({
  pins,
  selectedId = null,
  onSelect,
  heightClass,
  labels,
}: {
  pins: MapPin[];
  /** The pin drawn in the brand color; the others are gray. */
  selectedId?: string | null;
  /** Called with a pin's id when it is clicked. */
  onSelect?: (id: string) => void;
  /** Tailwind height of the map, e.g. "h-64" — the skeleton takes the same. */
  heightClass: string;
  labels: PlacesMapLabels;
}) {
  const access = useGeoPermission();

  // Same size as the map: nothing jumps when the browser answers.
  if (access.state === "unknown") return <Skeleton className={heightClass} />;

  if (access.state !== "granted") {
    return (
      <LockedMap
        heightClass={heightClass}
        message={access.state === "denied" ? labels.denied : labels.locked}
        // A blocked site can only be unblocked from the browser's settings:
        // asking again would do nothing, so no button.
        action={
          access.state === "denied" ? null : (
            <Button
              type="button"
              size="sm"
              onClick={access.request}
              disabled={access.requesting}
            >
              {labels.enable}
            </Button>
          )
        }
      />
    );
  }

  return (
    <div
      role="region"
      aria-label={labels.label}
      // `isolate`: Leaflet stacks its layers up to z-index 1000; this keeps
      // them under the page's own header, tab bar and toasts.
      className={cn(
        "relative isolate overflow-hidden rounded-sm border border-line",
        heightClass,
      )}
    >
      <LeafletCanvas
        pins={pins}
        selectedId={selectedId}
        onSelect={onSelect}
        interactive
      />
    </div>
  );
}

function LockedMap({
  heightClass,
  message,
  action,
}: {
  heightClass: string;
  message: string;
  action: React.ReactNode;
}) {
  // Drawn once per appearance. This component only ever renders in the
  // browser (the server stops at the skeleton above), so the random pick
  // cannot differ between server and client.
  const [decoy] = useState(() => randomDecoyPoint());

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-sm border border-line",
        heightClass,
      )}
    >
      {/* `grayscale` drains the color; `inert` takes the map out of the tab
          order and away from the mouse. */}
      <div className="absolute inset-0 opacity-70 grayscale" inert>
        <LeafletCanvas pins={[]} center={decoy} interactive={false} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="flex max-w-sm flex-col items-center gap-3 rounded-sm border border-line bg-surface p-5 text-center shadow-md">
          <LocateOff className="h-5 w-5 text-ink-muted" strokeWidth={1.75} />
          <p className="text-sm text-ink">{message}</p>
          {action}
        </div>
      </div>
    </div>
  );
}

function pinIcon(L: Leaflet, selected: boolean) {
  return L.divIcon({
    // No Leaflet default class: the pin is drawn by `.repere-pin` (globals.css).
    className: "",
    html: `<span class="repere-pin${selected ? " is-selected" : ""}"></span>`,
    iconSize: [24, 32],
    iconAnchor: [12, 30],
    tooltipAnchor: [0, -28],
  });
}

function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ??
      char,
  );
}

/**
 * The Leaflet map itself. Leaflet is not a React library: it is created in
 * an effect, on a DOM node React leaves alone, and destroyed in the effect's
 * cleanup. It is imported inside the effect because it reads `window` as
 * soon as it loads, which does not exist while the server renders.
 */
function LeafletCanvas({
  pins,
  selectedId = null,
  onSelect,
  center,
  interactive,
}: {
  pins: MapPin[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Where to look when there is no pin (the locked map). */
  center?: MapPoint;
  interactive: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<Leaflet | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  // Latest values, readable from Leaflet's own event handlers without
  // rebuilding the map each time the parent re-renders.
  const onSelectRef = useRef(onSelect);
  const selectedIdRef = useRef(selectedId);
  useEffect(() => {
    onSelectRef.current = onSelect;
    selectedIdRef.current = selectedId;
  });

  // The map is rebuilt only when the pins themselves change.
  const pinsKey = pins.map((pin) => `${pin.id}:${pin.lat}:${pin.lng}`).join("|");

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;
    const markers = markersRef.current;

    import("leaflet").then(({ default: L }) => {
      if (cancelled || !containerRef.current) return;
      leafletRef.current = L;

      map = L.map(containerRef.current, {
        zoomControl: interactive,
        dragging: interactive,
        doubleClickZoom: interactive,
        touchZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
        // The page scrolls with the wheel; the map zooms with its buttons.
        scrollWheelZoom: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      for (const pin of pins) {
        const marker = L.marker([pin.lat, pin.lng], {
          icon: pinIcon(L, pin.id === selectedIdRef.current),
          title: pin.name,
        }).addTo(map);
        marker.bindTooltip(
          `<strong>${escapeHtml(pin.name)}</strong>${pin.caption ? `<br>${escapeHtml(pin.caption)}` : ""}`,
        );
        marker.on("click", () => onSelectRef.current?.(pin.id));
        markers.set(pin.id, marker);
      }

      if (pins.length > 1) {
        // Every pin in view, with room around the outermost ones.
        map.fitBounds(L.latLngBounds(pins.map((pin) => [pin.lat, pin.lng])), {
          padding: [36, 36],
        });
      } else {
        const focus = pins[0] ?? center ?? { lat: 46.6, lng: 2.4 };
        // One place: street level. The locked map: the whole city.
        map.setView([focus.lat, focus.lng], pins.length === 1 ? 15 : 12);
      }
    });

    return () => {
      cancelled = true;
      map?.remove();
      markers.clear();
    };
    // `pinsKey` stands for `pins`; `center` only matters when the map is built.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinsKey, interactive]);

  // Choosing a location only repaints the pins: the map stays where it is.
  useEffect(() => {
    const L = leafletRef.current;
    if (!L) return;
    markersRef.current.forEach((marker, id) => {
      marker.setIcon(pinIcon(L, id === selectedId));
    });
  }, [selectedId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
