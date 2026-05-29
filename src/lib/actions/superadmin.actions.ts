"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { db } from "@/db/index"
import { mosques } from "@/db/schema"
import { eq } from "drizzle-orm"

export type ActionResult<T = void> =
  | { success: true;  data: T;       error?: never }
  | { success: false; error: string; data?: never  }

const MosqueSchema = z.object({
  slug:              z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug : minuscules, chiffres et tirets uniquement"),
  name:              z.string().min(1).max(200),
  city:              z.string().min(1).max(100),
  country:           z.string().min(1).max(100),
  latitude:          z.number().min(-90).max(90),
  longitude:         z.number().min(-180).max(180),
  timezone:          z.string().min(1),
  calculationMethod: z.enum(["MWL", "ISNA", "Egyptian", "UmmAlQura", "Karachi"]),
  adminEmail:        z.string().email("Email invalide"),
  isVerified:        z.boolean().default(false),
})

function parseForm(formData: FormData) {
  return {
    slug:              String(formData.get("slug") ?? "").trim().toLowerCase(),
    name:              formData.get("name"),
    city:              formData.get("city"),
    country:           formData.get("country"),
    latitude:          Number(formData.get("latitude")),
    longitude:         Number(formData.get("longitude")),
    timezone:          formData.get("timezone"),
    calculationMethod: formData.get("calculationMethod"),
    adminEmail:        String(formData.get("adminEmail") ?? "").trim().toLowerCase(),
    isVerified:        formData.get("isVerified") === "true",
  }
}

export async function createMosque(formData: FormData): Promise<ActionResult<{ id: number }>> {
  await requireSuperAdmin()

  const parsed = MosqueSchema.safeParse(parseForm(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  try {
    const [mosque] = await db
      .insert(mosques)
      .values(parsed.data)
      .returning({ id: mosques.id })

    revalidatePath("/super-admin")
    return { success: true, data: { id: mosque.id } }
  } catch (error) {
    // Erreur probable : slug déjà pris (unique)
    return {
      success: false,
      error: error instanceof Error && error.message.includes("unique")
        ? "Ce slug est déjà utilisé."
        : "Erreur lors de la création.",
    }
  }
}

export async function updateMosqueAdmin(id: number, formData: FormData): Promise<ActionResult> {
  await requireSuperAdmin()

  const parsed = MosqueSchema.safeParse(parseForm(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  try {
    await db.update(mosques).set(parsed.data).where(eq(mosques.id, id))
    revalidatePath("/super-admin")
    revalidatePath(`/m/${parsed.data.slug}`)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour." }
  }
}

export async function deleteMosque(id: number): Promise<ActionResult> {
  await requireSuperAdmin()

  try {
    await db.delete(mosques).where(eq(mosques.id, id))
    revalidatePath("/super-admin")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la suppression. Vérifiez qu'aucune donnée n'y est rattachée." }
  }
}
