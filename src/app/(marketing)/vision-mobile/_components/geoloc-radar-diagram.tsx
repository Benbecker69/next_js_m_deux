// Decorative but content-grounded: a schematic reading of "spaces around
// you" ranked by distance, echoing the real haversine sort already used on
// /reserver — not a generic radar/pulse graphic. Hidden from assistive tech.
const NEARBY = [
  { label: "Salle Ampère · 90 m", angle: -35, radius: 34, highlight: true },
  { label: "Poste flex · 140 m", angle: 60, radius: 44 },
  { label: "Bureau privé · 210 m", angle: 165, radius: 58 },
  { label: "Phone booth · 260 m", angle: -140, radius: 68 },
];

function point(angleDeg: number, radiusPct: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: `${50 + radiusPct * Math.cos(rad)}%`,
    top: `${50 + radiusPct * Math.sin(rad)}%`,
  };
}

export function GeolocRadarDiagram() {
  return (
    <div aria-hidden="true" className="rounded-sm border border-line p-6">
      <div className="relative mx-auto aspect-square w-full max-w-[220px]">
        {[1, 0.66, 0.33].map((scale) => (
          <span
            key={scale}
            className="absolute rounded-full border border-line"
            style={{
              inset: `${(1 - scale) * 50}%`,
            }}
          />
        ))}

        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />

        {NEARBY.map((item) => {
          const { left, top } = point(item.angle, item.radius);
          return (
            <span
              key={item.label}
              className={
                "absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border " +
                (item.highlight ? "border-pine bg-pine" : "border-ink-muted bg-paper")
              }
              style={{ left, top }}
            />
          );
        })}
      </div>

      <p className="mt-5 text-center text-xs text-ink-muted">
        Salle Ampère <span className="text-line">·</span> 90 m — libre maintenant
      </p>
    </div>
  );
}
