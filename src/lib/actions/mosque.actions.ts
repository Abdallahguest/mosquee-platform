"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSessionMosque } from "@/lib/auth-helpers"
import { db } from "@/db/index"
import { mosques } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { ActionResult } from "./action-result"

const MosqueSettingsSchema = z.object({
  name:              z.string().min(1, "NAME_REQUIRED").max(200, "NAME_TOO_LONG"),
  city:              z.string().min(1, "CITY_REQUIRED").max(100, "CITY_TOO_LONG"),
  country:           z.string().min(1, "COUNTRY_REQUIRED").max(100, "COUNTRY_TOO_LONG"),
  // Coordonnées précises (optionnelles, champs libres)
  commune:  z.string().max(100, "COMMUNE_TOO_LONG").optional(),
  quartier: z.string().max(100, "QUARTIER_TOO_LONG").optional(),
  secteur:  z.string().max(100, "SECTEUR_TOO_LONG").optional(),
  latitude:          z.number({ message: "LATITUDE_INVALID" }).min(-90, "LATITUDE_INVALID").max(90, "LATITUDE_INVALID"),
  longitude:         z.number({ message: "LONGITUDE_INVALID" }).min(-180, "LONGITUDE_INVALID").max(180, "LONGITUDE_INVALID"),
  timezone:          z.string().min(1, "TIMEZONE_REQUIRED"),
  calculationMethod: z.enum(["MWL", "ISNA", "Egyptian", "UmmAlQura", "Karachi"], { message: "METHOD_INVALID" }),
  donationUrl:  z.string().url("DONATION_URL_INVALID").or(z.literal("")).optional(),
  contactEmail: z.string().email("CONTACT_EMAIL_INVALID").or(z.literal("")).optional(),
  contactPhone: z.string().max(50, "PHONE_TOO_LONG").optional(),
  // Textes personnalisés (optionnels)
  welcomeMessage: z.string().max(500, "WELCOME_TOO_LONG").optional(),
  footerText:     z.string().max(500, "FOOTER_TOO_LONG").optional(),
})

function collectCodes(error: z.ZodError): string[] {
  return error.issues.map((i) => i.message)
}

export async function updateMosqueSettings(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null || mosqueId !== id) {
    return { success: false, error: "UNAUTHORIZED" }
  }

  const raw = {
    name:              formData.get("name"),
    city:              formData.get("city"),
    country:           formData.get("country"),
    commune:  formData.get("commune")  || "",
    quartier: formData.get("quartier") || "",
    secteur:  formData.get("secteur")  || "",
    latitude:          Number(formData.get("latitude")),
    longitude:         Number(formData.get("longitude")),
    timezone:          formData.get("timezone"),
    calculationMethod: formData.get("calculationMethod"),
    donationUrl:  formData.get("donationUrl") || "",
    contactEmail: formData.get("contactEmail") || "",
    contactPhone: formData.get("contactPhone") || "",
    welcomeMessage: formData.get("welcomeMessage") || "",
    footerText:     formData.get("footerText") || "",
  }

  const parsed = MosqueSettingsSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA", codes: collectCodes(parsed.error) }
  }

  try {
    await db
      .update(mosques)
      .set({
        ...parsed.data,
        // Champs optionnels : chaîne vide → null (cohérent, pas de "" en base)
        commune:        parsed.data.commune        || null,
        quartier:       parsed.data.quartier       || null,
        secteur:        parsed.data.secteur        || null,
        donationUrl:    parsed.data.donationUrl    || null,
        contactEmail:   parsed.data.contactEmail   || null,
        contactPhone:   parsed.data.contactPhone   || null,
        welcomeMessage: parsed.data.welcomeMessage || null,
        footerText:     parsed.data.footerText     || null,
      })
      .where(eq(mosques.id, id))

    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    revalidatePath(`/m/${mosque.slug}`)

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "SAVE_FAILED" }
  }
}
