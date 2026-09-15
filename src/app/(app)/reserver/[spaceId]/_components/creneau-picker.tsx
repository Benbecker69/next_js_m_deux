"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils/cn";
import type { Reservation, Space } from "@/types/domain";
import { createReservationAction, type ReservationFormState } from "../_actions";

const OPENING_HOUR = 9;
const CLOSING_HOUR = 18; // last bookable slot starts at 17:00
const DAYS_AHEAD = 7;

function buildDayOptions(): Date[] {
  const days: Date[] = [];
  const now = new Date();
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const day = new Date(now);
    day.setDate(day.getDate() + i);
    days.push(day);
  }
  return days;
}

function isoAt(day: Date, hour: number): string {
  const d = new Date(day);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const initialState: ReservationFormState = { error: null };

export function CreneauPicker({
  space,
  existingReservations,
  credits,
}: {
  space: Space;
  existingReservations: Reservation[];
  credits: number;
}) {
  const days = useMemo(() => buildDayOptions(), []);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState(
    createReservationAction,
    initialState,
  );

  const day = days[selectedDay];
  const hours = Array.from(
    { length: CLOSING_HOUR - OPENING_HOUR },
    (_, i) => OPENING_HOUR + i,
  );

  const isTaken = (hour: number) => {
    const start = isoAt(day, hour);
    const end = isoAt(day, hour + 1);
    return existingReservations.some(
      (reservation) =>
        reservation.status === "confirmed" &&
        new Date(start) < new Date(reservation.endAt) &&
        new Date(end) > new Date(reservation.startAt),
    );
  };

  const startAt = selectedHour !== null ? isoAt(day, selectedHour) : "";
  const endAt = selectedHour !== null ? isoAt(day, selectedHour + 1) : "";
  const insufficientCredits = credits < space.pricePerHour;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="spaceId" value={space.id} />
      <input type="hidden" name="startAt" value={startAt} />
      <input type="hidden" name="endAt" value={endAt} />

      <div>
        <p className="text-sm font-medium text-ink">Jour</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {days.map((d, index) => (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => {
                setSelectedDay(index);
                setSelectedHour(null);
              }}
              className={cn(
                "rounded-sm border border-line px-3 py-2 text-sm",
                index === selectedDay
                  ? "border-pine bg-pine/10 text-pine"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {d.toLocaleDateString("fr-FR", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-ink">Heure</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {hours.map((hour) => {
            const taken = isTaken(hour);
            return (
              <button
                key={hour}
                type="button"
                disabled={taken}
                onClick={() => setSelectedHour(hour)}
                className={cn(
                  "rounded-sm border border-line px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40",
                  selectedHour === hour
                    ? "border-pine bg-pine/10 text-pine"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {hour}h
              </button>
            );
          })}
        </div>
      </div>

      {selectedHour !== null && (
        <div className="border-t border-line pt-4 text-sm text-ink">
          <p>
            {space.pricePerHour} crédits pour ce créneau d&apos;une heure — il vous reste{" "}
            {credits} crédits.
          </p>
        </div>
      )}

      {state.error && <Alert variant="error">{state.error}</Alert>}
      {insufficientCredits && (
        <Alert variant="error">Crédits insuffisants pour réserver cet espace.</Alert>
      )}

      <Button
        type="submit"
        disabled={selectedHour === null || pending || insufficientCredits}
      >
        {pending ? "Confirmation…" : "Confirmer la réservation"}
      </Button>
    </form>
  );
}
