import { z } from "zod";

export const createReservationSchema = z
  .object({
    spaceId: z
      .string({ error: "Choisissez un espace à réserver." })
      .min(1, "Choisissez un espace à réserver."),
    startAt: z.iso.datetime({ error: "Choisissez un jour et une heure de début." }),
    endAt: z.iso.datetime({ error: "Choisissez un jour et une heure de début." }),
  })
  .refine((value) => new Date(value.endAt) > new Date(value.startAt), {
    message: "L'heure de fin doit être après l'heure de début.",
    path: ["endAt"],
  });

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
