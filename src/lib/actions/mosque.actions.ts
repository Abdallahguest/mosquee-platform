"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/db/index"
import { mosques } from "@/db/schema"
import { eq } from "drizzle-orm"

const MosqueSettingsSchema = z.object({
  name:              z.string().min(1).max(200),
  city:              z.string().min(1).max(100),
  country:           z.string().min(1).max(100),
  latitude:          z.number().min(-90).max(90),
  longitude:         z.number().min(-180).max(180),
  timezone:          z.string().min(1),
  calculationMethod: z.enum(["MWL", "ISNA", "Egyptian", "UmmAlQura", "Karachi"]),
  // Ajustements iqama (0 à 60 minutes)
  iqamaFajr:    z.number().int().min(0).max(60),
  iqamaDhuhr:   z.number().int().min(0).max(60),
  iqamaAsr:     z.number().int().min(0).max(60),
  iqamaMaghrib: z.number().int().min(0).max(60),
  iqamaIsha:    z.number().int().min(0).max(60),
})

export type ActionResult<T = void> =
  | { success: true;  data: T;       error?: never }
  | { success: false; error: string; data?: never  }

export async function updateMosqueSettings(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const raw = {
    name:              formData.get("name"),
    city:              formData.get("city"),
    country:           formData.get("country"),
    latitude:          Number(formData.get("latitude")),
    longitude:         Number(formData.get("longitude")),
    timezone:          formData.get("timezone"),
    calculationMethod: formData.get("calculationMethod"),
    iqamaFajr:    Number(formData.get("iqamaFajr")),
    iqamaDhuhr:   Number(formData.get("iqamaDhuhr")),
    iqamaAsr:     Number(formData.get("iqamaAsr")),
    iqamaMaghrib: Number(formData.get("iqamaMaghrib")),
    iqamaIsha:    Number(formData.get("iqamaIsha")),
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
      .set(parsed.data)
      .where(eq(mosques.id, id))

    revalidatePath("/admin")
    revalidatePath("/admin/settings")
    revalidatePath(`/m/${formData.get("slug")}`)

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la sauvegarde." }
  }
}
