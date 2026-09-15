import { z } from "zod";

export const createReservationSchema = z
  .object({
    spaceId: z.string().min(1, "Choisissez un espace."),
    startAt: z.iso.datetime({ message: "Créneau de début invalide." }),
    endAt: z.iso.datetime({ message: "Créneau de fin invalide." }),
  })
  .refine((value) => new Date(value.endAt) > new Date(value.startAt), {
    message: "Le créneau de fin doit être après le créneau de début.",
    path: ["endAt"],
  });

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
