import { Smartphone, DoorOpen } from "lucide-react";

// Decorative but content-grounded (same principle as SpacePlan on the
// homepage): a schematic of a badge tap at a real referenced location, not a
// generic "connectivity" illustration. Hidden from assistive tech — the
// heading and body copy next to it carry the actual message.
export function NfcTapDiagram() {
  return (
    <div aria-hidden="true" className="rounded-sm border border-line p-6">
      <div className="flex items-center justify-center gap-3">
        <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded-sm border border-line">
          <Smartphone className="h-5 w-5 text-ink-muted" strokeWidth={1.5} />
        </div>

        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="block h-px rounded-full bg-ochre"
              style={{ width: `${10 + index * 6}px`, opacity: 0.35 + index * 0.2 }}
            />
          ))}
        </div>

        <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded-sm border border-ochre/40 bg-ochre/10">
          <DoorOpen className="h-5 w-5 text-ochre" strokeWidth={1.5} />
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-ink-muted">
        Le Chantier <span className="text-line">·</span> Lyon — badge reconnu
      </p>
    </div>
  );
}
