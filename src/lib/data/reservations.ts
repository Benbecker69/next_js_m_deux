import "server-only";
import type { Reservation } from "@/types/domain";
import { createCollection } from "./store";
import { SEED_RESERVATIONS } from "./seed";

const reservations = createCollection<Reservation>("reservations", SEED_RESERVATIONS);

export async function listReservations(): Promise<Reservation[]> {
  return reservations.list();
}

export async function getReservationById(id: string): Promise<Reservation | null> {
  return reservations.get(id);
}

export async function listReservationsByUser(userId: string): Promise<Reservation[]> {
  return reservations.filter((reservation) => reservation.userId === userId);
}

export async function listReservationsBySpace(spaceId: string): Promise<Reservation[]> {
  return reservations.filter((reservation) => reservation.spaceId === spaceId);
}

export async function createReservation(reservation: Reservation): Promise<Reservation> {
  return reservations.insert(reservation);
}

export async function updateReservation(
  id: string,
  patch: Partial<Reservation>,
): Promise<Reservation | null> {
  return reservations.update(id, patch);
}
