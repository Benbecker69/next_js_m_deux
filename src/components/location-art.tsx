import { cn } from "@/lib/utils/cn";

/**
 * Per-location line-art scenes — the site's answer to "add images" without
 * reaching for stock photography, which would either mismatch these
 * fictional venues or clash with the hairline/architect's-plan look used
 * everywhere else (SpacePlan, the NFC/geoloc diagrams). Each scene reads a
 * real detail out of that location's own description (seed.ts) — Le
 * Chantier's "grandes verrières" become a glazed sawtooth roof, La
 * Verrière's greenhouse past becomes an actual glasshouse silhouette — so
 * it's illustration grounded in content, the same principle as those
 * earlier diagrams, not decoration for its own sake.
 */
type RoofStyle = "sawtooth" | "glasshouse" | "mansard" | "gantry" | "attic" | "lookout";

const STYLE_BY_SLUG: Record<string, RoofStyle> = {
  "le-chantier-lyon": "sawtooth",
  "station-9-nantes": "gantry",
  "la-verriere-bordeaux": "glasshouse",
  "le-comptoir-lille": "mansard",
  "le-grenier": "attic",
};

const GROUND = <line x1="20" y1="250" x2="380" y2="250" strokeOpacity={0.3} />;

function Sawtooth() {
  return (
    <>
      {GROUND}
      <rect x="60" y="140" width="280" height="110" />
      <polyline points="60,140 95,95 130,140 165,95 200,140 235,95 270,140 305,95 340,140" />
      <rect
        x="85"
        y="103"
        width="18"
        height="30"
        className="fill-pine/20"
        strokeWidth={1}
      />
      <rect
        x="225"
        y="103"
        width="18"
        height="30"
        className="fill-pine/20"
        strokeWidth={1}
      />
      <g strokeWidth={1}>
        <rect x="100" y="170" width="60" height="50" />
        <line x1="130" y1="170" x2="130" y2="220" />
        <line x1="100" y1="195" x2="160" y2="195" />
        <rect x="180" y="170" width="60" height="50" />
        <line x1="210" y1="170" x2="210" y2="220" />
        <line x1="180" y1="195" x2="240" y2="195" />
      </g>
      <rect
        x="270"
        y="215"
        width="30"
        height="35"
        className="fill-pine/25"
        strokeWidth={1}
      />
    </>
  );
}

function Glasshouse() {
  return (
    <>
      {GROUND}
      <rect x="90" y="190" width="220" height="60" />
      <path d="M70,190 L200,90 L330,190 Z" />
      <g strokeWidth={1} strokeOpacity={0.6}>
        <line x1="200" y1="90" x2="110" y2="190" />
        <line x1="200" y1="90" x2="155" y2="190" />
        <line x1="200" y1="90" x2="245" y2="190" />
        <line x1="200" y1="90" x2="290" y2="190" />
        <line x1="125" y1="153" x2="275" y2="153" />
        <line x1="105" y1="212" x2="125" y2="212" />
        <line x1="140" y1="212" x2="160" y2="212" />
        <line x1="175" y1="212" x2="195" y2="212" />
        <line x1="210" y1="212" x2="230" y2="212" />
        <line x1="245" y1="212" x2="265" y2="212" />
        <line x1="280" y1="212" x2="300" y2="212" />
      </g>
      <rect
        x="185"
        y="220"
        width="30"
        height="30"
        className="fill-pine/25"
        strokeWidth={1}
      />
      <g strokeWidth={1.25} strokeOpacity={0.7}>
        <path d="M55,250 Q52,225 65,218" />
        <path d="M340,250 Q345,222 335,212" />
      </g>
    </>
  );
}

function Mansard() {
  return (
    <>
      {GROUND}
      <rect x="80" y="130" width="240" height="120" />
      <path d="M80,130 L110,80 L290,80 L320,130 Z" />
      <rect x="230" y="60" width="16" height="24" />
      <g strokeWidth={1} strokeOpacity={0.35}>
        <line x1="80" y1="155" x2="320" y2="155" />
        <line x1="80" y1="178" x2="320" y2="178" />
        <line x1="80" y1="201" x2="320" y2="201" />
        <line x1="80" y1="224" x2="320" y2="224" />
      </g>
      <g strokeWidth={1}>
        <rect x="105" y="150" width="34" height="34" />
        <line x1="122" y1="150" x2="122" y2="184" />
        <line x1="105" y1="167" x2="139" y2="167" />
        <rect x="183" y="150" width="34" height="34" />
        <line x1="200" y1="150" x2="200" y2="184" />
        <line x1="105" y1="167" x2="139" y2="167" />
        <line x1="183" y1="167" x2="217" y2="167" />
        <rect x="261" y="150" width="34" height="34" />
        <line x1="278" y1="150" x2="278" y2="184" />
        <line x1="261" y1="167" x2="295" y2="167" />
      </g>
      <rect
        x="185"
        y="215"
        width="30"
        height="35"
        className="fill-ochre/25"
        strokeWidth={1}
      />
    </>
  );
}

function Gantry() {
  return (
    <>
      {GROUND}
      <rect x="55" y="160" width="200" height="90" />
      <line x1="55" y1="160" x2="255" y2="160" strokeWidth={1} />
      <g strokeWidth={1}>
        <circle cx="95" cy="200" r="14" />
        <circle cx="150" cy="200" r="14" />
        <circle cx="205" cy="200" r="14" />
      </g>
      <g>
        <line x1="305" y1="230" x2="305" y2="105" />
        <line x1="305" y1="105" x2="360" y2="122" />
        <line x1="305" y1="118" x2="285" y2="105" />
        <line x1="352" y1="126" x2="352" y2="150" strokeWidth={1} />
        <circle cx="352" cy="153" r="3" className="fill-ink" strokeWidth={0} />
      </g>
      <g strokeWidth={1} strokeOpacity={0.5}>
        <line x1="20" y1="250" x2="255" y2="250" />
        <line x1="60" y1="250" x2="60" y2="242" />
        <line x1="90" y1="250" x2="90" y2="242" />
        <line x1="120" y1="250" x2="120" y2="242" />
      </g>
      <rect
        x="130"
        y="215"
        width="28"
        height="35"
        className="fill-pine/25"
        strokeWidth={1}
      />
    </>
  );
}

function Attic() {
  return (
    <>
      {GROUND}
      <path d="M100,190 L200,70 L300,190 Z" />
      <circle cx="200" cy="140" r="20" strokeWidth={1.25} />
      <circle cx="200" cy="140" r="20" className="fill-pine/15" strokeWidth={0} />
      <rect x="140" y="190" width="120" height="50" />
      <g strokeWidth={1}>
        <rect x="155" y="203" width="24" height="24" />
        <rect x="221" y="203" width="24" height="24" />
      </g>
      <rect
        x="188"
        y="215"
        width="24"
        height="25"
        className="fill-pine/25"
        strokeWidth={1}
      />
    </>
  );
}

function Lookout() {
  return (
    <>
      {GROUND}
      <rect x="90" y="150" width="220" height="100" />
      <rect x="175" y="100" width="50" height="50" />
      <path d="M175,100 L200,75 L225,100 Z" />
      <g strokeWidth={1}>
        <rect x="115" y="180" width="30" height="30" />
        <rect x="185" y="180" width="30" height="30" />
        <rect x="255" y="180" width="30" height="30" />
      </g>
      <rect
        x="185"
        y="215"
        width="30"
        height="35"
        className="fill-pine/25"
        strokeWidth={1}
      />
    </>
  );
}

const SCENES: Record<RoofStyle, () => React.JSX.Element> = {
  sawtooth: Sawtooth,
  glasshouse: Glasshouse,
  mansard: Mansard,
  gantry: Gantry,
  attic: Attic,
  lookout: Lookout,
};

export function LocationArt({
  slug,
  variant = "standalone",
  className,
}: {
  slug: string;
  /** "top": no bottom border, rounds only the top corners — for stacking
   *  directly above a content block that supplies its own bottom border,
   *  so the two read as one card rather than two boxes with a gap. */
  variant?: "standalone" | "top";
  className?: string;
}) {
  const style = STYLE_BY_SLUG[slug] ?? "lookout";
  const Scene = SCENES[style];

  return (
    <div
      className={cn(
        "aspect-[4/3] w-full overflow-hidden border border-line bg-paper",
        variant === "standalone" ? "rounded-sm" : "rounded-t-sm border-b-0",
        className,
      )}
    >
      <svg viewBox="0 0 400 280" className="h-full w-full text-ink" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round">
          <Scene />
        </g>
      </svg>
    </div>
  );
}
