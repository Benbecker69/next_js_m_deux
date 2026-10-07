import { describe, expect, it } from "vitest";
import { credits, validationFailure } from "@/lib/feedback/action-result";
import { distanceKm } from "@/lib/geo/distance";
import { slugify } from "@/lib/utils/slugify";
import { changePasswordSchema, loginSchema, registerSchema } from "./auth";
import { createReservationSchema } from "./reservation";
import { spaceSchema } from "./space";
import { adminUserSchema } from "./user";

/** The messages of a refused input, by field. */
function errorsOf(result: { success: boolean; error?: unknown }) {
  if (result.success) return {};
  return validationFailure(result.error as never).fieldErrors;
}

describe("registration", () => {
  const valid = { name: "Camille", email: "camille@example.com", password: "demo1234" };

  it("accepts a complete form", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("says how many characters the password has", () => {
    const errors = errorsOf(registerSchema.safeParse({ ...valid, password: "abcde" }));
    expect(errors.password).toContain("au moins 8 caractères");
    expect(errors.password).toContain("5");
  });

  it("refuses a name made of spaces and an invalid address, in French", () => {
    const errors = errorsOf(
      registerSchema.safeParse({ ...valid, name: "   ", email: "camille" }),
    );
    expect(errors.name).toContain("nom");
    expect(errors.email).toContain("n'est pas valide");
  });

  it("answers in French when a field is missing altogether", () => {
    const errors = errorsOf(loginSchema.safeParse({ email: null, password: null }));
    expect(errors.email).toBe("Saisissez votre adresse e-mail.");
    expect(errors.password).toBe("Saisissez votre mot de passe.");
  });
});

describe("password change", () => {
  const valid = {
    currentPassword: "demo1234",
    newPassword: "nouveau-secret",
    confirmPassword: "nouveau-secret",
  };

  it("accepts a new password typed twice", () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("puts the mismatch under the confirmation field", () => {
    const errors = errorsOf(
      changePasswordSchema.safeParse({ ...valid, confirmPassword: "autre-chose" }),
    );
    expect(Object.keys(errors)).toEqual(["confirmPassword"]);
  });

  it("refuses the same password as the current one", () => {
    const errors = errorsOf(
      changePasswordSchema.safeParse({
        currentPassword: "demo1234",
        newPassword: "demo1234",
        confirmPassword: "demo1234",
      }),
    );
    expect(errors.newPassword).toContain("différent");
  });
});

describe("reservation", () => {
  const slot = {
    spaceId: "chantier-flex",
    startAt: "2026-10-08T12:00:00.000Z",
    endAt: "2026-10-08T14:00:00.000Z",
  };

  it("accepts a space and two ISO instants", () => {
    expect(createReservationSchema.safeParse(slot).success).toBe(true);
  });

  it("refuses an end before the start", () => {
    const errors = errorsOf(
      createReservationSchema.safeParse({ ...slot, endAt: "2026-10-08T11:00:00.000Z" }),
    );
    expect(errors.endAt).toContain("après");
  });

  it("refuses a date that is not an ISO instant", () => {
    expect(
      createReservationSchema.safeParse({ ...slot, startAt: "demain 14h" }).success,
    ).toBe(false);
  });
});

describe("back-office forms", () => {
  it("refuses an empty number instead of reading it as 0", () => {
    // The actions turn an empty field into NaN before validating.
    const errors = errorsOf(
      adminUserSchema.safeParse({ role: "member", credits: Number.NaN }),
    );
    expect(errors.credits).toContain("nombre entier");
  });

  it("refuses a negative balance and an unknown role", () => {
    expect(adminUserSchema.safeParse({ role: "member", credits: -1 }).success).toBe(
      false,
    );
    expect(adminUserSchema.safeParse({ role: "owner", credits: 10 }).success).toBe(false);
  });

  it("only accepts the four space types", () => {
    const space = {
      locationId: "le-chantier-lyon",
      name: "Salle Ampère",
      type: "salle-reunion",
      capacity: 4,
      pricePerHour: 18,
      status: "active",
    };
    expect(spaceSchema.safeParse(space).success).toBe(true);
    expect(spaceSchema.safeParse({ ...space, type: "piscine" }).success).toBe(false);
    expect(spaceSchema.safeParse({ ...space, capacity: 0 }).success).toBe(false);
  });
});

describe("small helpers", () => {
  it("summarises several invalid fields with a count", () => {
    const result = registerSchema.safeParse({ name: "", email: "", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(validationFailure(result.error).error).toBe(
        "3 champs sont à corriger avant de continuer.",
      );
    }
  });

  it("writes credits in the singular and the plural", () => {
    expect(credits(1)).toBe("1 crédit");
    expect(credits(18)).toBe("18 crédits");
  });

  it("turns a location name into a web address", () => {
    expect(slugify("La Verrière — Bordeaux")).toBe("la-verriere-bordeaux");
    expect(slugify("  Station 9  ")).toBe("station-9");
    expect(slugify("!!!")).toBe("");
  });

  it("measures the distance between two points", () => {
    const lyon = { lat: 45.7605, lng: 4.8607 };
    const nantes = { lat: 47.2065, lng: -1.5484 };
    expect(distanceKm(lyon, lyon)).toBe(0);
    // About 515 km as the crow flies.
    expect(distanceKm(lyon, nantes)).toBeGreaterThan(500);
    expect(distanceKm(lyon, nantes)).toBeLessThan(530);
    expect(distanceKm(lyon, nantes)).toBeCloseTo(distanceKm(nantes, lyon), 6);
  });
});
