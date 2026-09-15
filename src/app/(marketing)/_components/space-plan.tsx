import { cn } from "@/lib/utils/cn";

// Decorative but content-grounded: a schematic of a coworking floor, not a
// generic illustration. Purely visual — hidden from assistive tech, the
// headline and CTAs next to it carry the actual message.
type CellState = "free" | "booked" | "limited";

const GRID: { state: CellState; label?: string }[] = [
  { state: "free" },
  { state: "free" },
  { state: "booked" },
  { state: "free" },
  { state: "free" },
  { state: "limited" },
  { state: "free" },
  { state: "booked", label: "Salle Ampère" },
  { state: "free" },
  { state: "free" },
  { state: "booked" },
  { state: "free" },
  { state: "limited", label: "2 places" },
  { state: "free" },
  { state: "free" },
  { state: "booked" },
  { state: "free" },
  { state: "free" },
  { state: "free" },
  { state: "free" },
  { state: "limited" },
  { state: "free" },
  { state: "booked" },
  { state: "free" },
];

const STATE_CLASSES: Record<CellState, string> = {
  free: "border border-line",
  booked: "border border-pine/30 bg-pine/15",
  limited: "border border-ochre/40 bg-ochre/15",
};

export function SpacePlan() {
  return (
    <div aria-hidden="true" className="grid grid-cols-6 gap-1.5">
      {GRID.map((cell, index) => (
        <div
          key={index}
          className={cn(
            "aspect-square rounded-sm p-1 text-[9px] leading-tight text-ink-muted",
            STATE_CLASSES[cell.state],
          )}
        >
          {cell.label}
        </div>
      ))}
    </div>
  );
}
