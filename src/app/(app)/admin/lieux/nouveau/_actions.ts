"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createLocation, getLocationBySlug } from "@/lib/data/locations";
import { slugify } from "@/lib/utils/slugify";
import type { Location } from "@/types/domain";
import type { LocationFormState } from "../_components/location-form";
import { parseLocationForm, rawLocationValues } from "../_lib/location-form-data";
import { withFlash } from "@/lib/feedback/flash-messages";
import { validationFailure } from "@/lib/feedback/action-result";
import { guardAction } from "@/lib/feedback/guard-action";

export async function createLocationAction(
  _prevState: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  await requireAdmin();
  const values = rawLocationValues(formData);

  const parsed = parseLocationForm(formData);
  if (!parsed.success) {
    return { ...validationFailure(parsed.error), success: false, values };
  }

  return guardAction<LocationFormState>(
    async () => {
      // The slug is the public URL (/lieux/<slug>) and must be unique: two
      // places with the same name would collide in the database.
      const slug = slugify(parsed.data.name);
      if (!slug) {
        const message =
          "Ce nom ne contient aucune lettre ni chiffre : il ne peut pas servir d'adresse web.";
        return { error: message, success: false, fieldErrors: { name: message }, values };
      }
      if (await getLocationBySlug(slug)) {
        const message = `Un lieu nommé « ${parsed.data.name} » existe déjà. Choisissez un autre nom, par exemple en ajoutant la ville.`;
        return { error: message, success: false, fieldErrors: { name: message }, values };
      }

      const location: Location = { id: crypto.randomUUID(), slug, ...parsed.data };
      await createLocation(location);
      revalidateTag("locations", "max");

      redirect(withFlash(`/admin/lieux/${location.id}`, "lieu-cree"));
    },
    (error) => ({ error, success: false, values }),
  );
}
