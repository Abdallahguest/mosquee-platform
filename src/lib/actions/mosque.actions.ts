"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSessionMosque } from "@/lib/auth-helpers"
import { db } from "@/db/index"
import { mosques } from "@/db/schema"
import { eq } from "drizzle-orm"

// Note : les délais iqama (minutes) ont été retirés — le modèle d'horaires
// est désormais "adhan + iqama saisis en HH:MM" (voir PrayerTimesForm).
// La méthode de calcul ne sert plus qu'à la SUGGESTION d'adhan, pas à
// l'affichage. Ce schéma ne couvre donc que l'identité, la géo, le fuseau,
// la méthode (pour la suggestion) et le contact/don.
const MosqueSettingsSchema = z.object({
  name:              z.string().min(1).max(200),
  city:              z.string().min(1).max(100),
  country:           z.string().min(1).max(100),
  latitude:          z.number().min(-90).max(90),
  longitude:         z.number().min(-180).max(180),
  timezone:          z.string().min(1),
  calculationMethod: z.enum(["MWL", "ISNA", "Egyptian", "UmmAlQura", "Karachi"]),
  // Contact et don (optionnels)
  donationUrl:  z.string().url("Lien de don invalide").or(z.literal("")).optional(),
  contactEmail: z.string().email("Email de contact invalide").or(z.literal("")).optional(),
  contactPhone: z.string().max(50).optional(),
})

export type ActionResult<T = void> =
  | { success: true;  data: T;       error?: never }
  | { success: false; error: string; data?: never  }

export async function updateMosqueSettings(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null || mosqueId !== id) {
    return { success: false, error: "Action non autorisée pour cette mosquée." }
  }

  const raw = {
    name:              formData.get("name"),
    city:              formData.get("city"),
    country:           formData.get("country"),
    latitude:          Number(formData.get("latitude")),
    longitude:         Number(formData.get("longitude")),
    timezone:          formData.get("timezone"),
    calculationMethod: formData.get("calculationMethod"),
    donationUrl:  formData.get("donationUrl") || "",
    contactEmail: formData.get("contactEmail") || "",
    contactPhone: formData.get("contactPhone") || "",
  }

  const parsed = MosqueSettingsSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    }
  }

  try {
    await db
      .update(mosques)
      .set({
        ...parsed.data,
        // Chaîne vide → null en base (cohérent et propre)
        donationUrl:  parsed.data.donationUrl  || null,
        contactEmail: parsed.data.contactEmail || null,
        contactPhone: parsed.data.contactPhone || null,
      })
      .where(eq(mosques.id, id))

    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    revalidatePath(`/m/${mosque.slug}`)

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la sauvegarde." }
  }
}
