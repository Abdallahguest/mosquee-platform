"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { db } from "@/db/index"
import { mosques } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { users } from "@/db/schema"

const CreateUserSchema = z.object({
  name:     z.string().min(1, "Nom requis").max(100),
  email:    z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe : 8 caractères minimum"),
})

export async function createUserAccount(formData: FormData): Promise<ActionResult<{ email: string }>> {
  await requireSuperAdmin()

  const parsed = CreateUserSchema.safeParse({
    name:     formData.get("name"),
    email:    String(formData.get("email") ?? "").trim().toLowerCase(),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  try {
    // Créer le compte via l'API Better-Auth (hash correct du mot de passe)
    await auth.api.signUpEmail({
      body: {
        name:     parsed.data.name,
        email:    parsed.data.email,
        password: parsed.data.password,
      },
    })

    // Marquer l'email comme vérifié directement (c'est le super-admin qui crée)
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.email, parsed.data.email))

    revalidatePath("/super-admin/users")
    return { success: true, data: { email: parsed.data.email } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error && error.message.toLowerCase().includes("exist")
        ? "Un compte existe déjà avec cet email."
        : "Erreur lors de la création du compte.",
    }
  }
}

export async function setUserVerified(userId: string, verified: boolean): Promise<ActionResult> {
  await requireSuperAdmin()

  try {
    await db
      .update(users)
      .set({ emailVerified: verified })
      .where(eq(users.id, userId))

    revalidatePath("/super-admin/users")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour." }
  }
}

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
  donationUrl:  z.string().url("Lien de don invalide").or(z.literal("")).optional(),
  contactEmail: z.string().email("Email invalide").or(z.literal("")).optional(),
  contactPhone: z.string().max(50).optional(),
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
    donationUrl:  formData.get("donationUrl") || null,
    contactEmail: formData.get("contactEmail") || null,
    contactPhone: formData.get("contactPhone") || null,
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
      .values({
        ...parsed.data,
        donationUrl:  parsed.data.donationUrl  || null,
        contactEmail: parsed.data.contactEmail || null,
        contactPhone: parsed.data.contactPhone || null,
      })
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
    await db.update(mosques)
    .set({
      ...parsed.data,
      donationUrl:  parsed.data.donationUrl  || null,
      contactEmail: parsed.data.contactEmail || null,
      contactPhone: parsed.data.contactPhone || null,
    })
    .where(eq(mosques.id, id))
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
