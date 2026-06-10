"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { db } from "@/db/index"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { mosques, users, mosqueAdmins } from "@/db/schema"
import { canSuperAdminActOnUser } from "@/lib/authorization"

export type ActionResult<T = void> =
  | { success: true;  data: T;       error?: never }
  | { success: false; error: string; data?: never  }

export async function assignAdminToMosque(mosqueId: number, userId: string): Promise<ActionResult> {
  await requireSuperAdmin()

  try {
    await db
      .insert(mosqueAdmins)
      .values({ mosqueId, userId })
      .onConflictDoNothing()  // évite le doublon si déjà lié

    revalidatePath(`/super-admin/mosques/${mosqueId}/admins`)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de l'assignation." }
  }
}

export async function removeAdminFromMosque(mosqueId: number, userId: string): Promise<ActionResult> {
  await requireSuperAdmin()

  try {
    await db
      .delete(mosqueAdmins)
      .where(and(eq(mosqueAdmins.mosqueId, mosqueId), eq(mosqueAdmins.userId, userId)))

    revalidatePath(`/super-admin/mosques/${mosqueId}/admins`)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors du retrait." }
  }
}

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
  const session = await requireSuperAdmin()

  // Récupérer le compte cible pour vérifier qu'on a le droit d'agir dessus
  const [target] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!target) return { success: false, error: "Compte introuvable." }

  if (!canSuperAdminActOnUser(
    { id: session.user.id, role: "super_admin" },   // garanti par requireSuperAdmin()
    { id: target.id, role: target.role }
  )) {
    return { success: false, error: "Action non autorisée sur ce compte." }
  }

  try {
    await db.update(users).set({ emailVerified: verified }).where(eq(users.id, userId))
    revalidatePath("/super-admin/users")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour." }
  }
}

const MosqueSchema = z.object({
  slug:              z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug : minuscules, chiffres et tirets uniquement"),
  name:              z.string().min(1).max(200),
  nameFr:            z.string().max(200).optional(),
  nameEn:            z.string().max(200).optional(),
  nameAr:            z.string().max(200).optional(),
  city:              z.string().min(1).max(100),
  country:           z.string().min(1).max(100),
  // Coordonnées précises (optionnelles, champs libres)
  commune:  z.string().max(100).optional(),
  quartier: z.string().max(100).optional(),
  secteur:  z.string().max(100).optional(),
  latitude:          z.number().min(-90).max(90),
  longitude:         z.number().min(-180).max(180),
  timezone:          z.string().min(1),
  calculationMethod: z.enum(["MWL", "ISNA", "Egyptian", "UmmAlQura", "Karachi"]),
  isVerified:        z.boolean().default(false),
  donationUrl:  z.string().url("Lien de don invalide").or(z.literal("")).optional(),
  contactEmail: z.string().email("Email invalide").or(z.literal("")).optional(),
  contactPhone: z.string().max(50).optional(),
})

function parseForm(formData: FormData) {
  return {
    slug:              String(formData.get("slug") ?? "").trim().toLowerCase(),
    name:              formData.get("name"),
    nameFr:            formData.get("nameFr") ?? "",
    nameEn:            formData.get("nameEn") ?? "",
    nameAr:            formData.get("nameAr") ?? "",
    city:              formData.get("city"),
    country:           formData.get("country"),
    commune:  formData.get("commune")  ?? "",
    quartier: formData.get("quartier") ?? "",
    secteur:  formData.get("secteur")  ?? "",
    latitude:          Number(formData.get("latitude")),
    longitude:         Number(formData.get("longitude")),
    timezone:          formData.get("timezone"),
    calculationMethod: formData.get("calculationMethod"),
    isVerified:        formData.get("isVerified") === "true",
    donationUrl:  formData.get("donationUrl")  ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
  }
}

export async function createMosque(formData: FormData): Promise<ActionResult<{ id: number }>> {
  await requireSuperAdmin()

  const parsed = MosqueSchema.safeParse(parseForm(formData))
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const champ = issue?.path?.join(".") ?? "champ inconnu"
    return { success: false, error: `Problème sur "${champ}" : ${issue?.message ?? "valeur invalide"}` }
  }

  try {
    const [mosque] = await db
      .insert(mosques)
      .values({
        ...parsed.data,
        nameFr:       parsed.data.nameFr       || null,
        nameEn:       parsed.data.nameEn       || null,
        nameAr:       parsed.data.nameAr       || null,
        commune:      parsed.data.commune      || null,
        quartier:     parsed.data.quartier     || null,
        secteur:      parsed.data.secteur      || null,
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
    const issue = parsed.error.issues[0]
    const champ = issue?.path?.join(".") ?? "champ inconnu"
    return { success: false, error: `Problème sur "${champ}" : ${issue?.message ?? "valeur invalide"}` }
  }

  try {
    await db.update(mosques)
    .set({
      ...parsed.data,
      nameFr:       parsed.data.nameFr       || null,
      nameEn:       parsed.data.nameEn       || null,
      nameAr:       parsed.data.nameAr       || null,
      commune:      parsed.data.commune      || null,
      quartier:     parsed.data.quartier     || null,
      secteur:      parsed.data.secteur      || null,
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

const ResetPasswordSchema = z.object({
  userId:      z.string().min(1),
  newPassword: z.string().min(8, "Mot de passe : 8 caractères minimum"),
})

export async function resetUserPassword(formData: FormData): Promise<ActionResult> {
  const session = await requireSuperAdmin()

  // 1. Valider les entrées
  const parsed = ResetPasswordSchema.safeParse({
    userId:      formData.get("userId"),
    newPassword: formData.get("newPassword"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  // 2. Récupérer le compte cible pour vérifier qu'on a le droit d'agir dessus
  const [target] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, parsed.data.userId))
    .limit(1)

  if (!target) return { success: false, error: "Compte introuvable." }

  // 3. Un super-admin ne peut pas réinitialiser le mot de passe d'un autre super-admin
  if (!canSuperAdminActOnUser(
    { id: session.user.id, role: "super_admin" },   // garanti par requireSuperAdmin()
    { id: target.id, role: target.role }
  )) {
    return { success: false, error: "Action non autorisée sur ce compte." }
  }

  // 4. Réinitialiser le mot de passe via l'API interne Better-Auth
  try {
    const ctx = await auth.$context
    const hashed = await ctx.password.hash(parsed.data.newPassword)
    await ctx.internalAdapter.updatePassword(parsed.data.userId, hashed)

    revalidatePath("/super-admin/users")
    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la réinitialisation.",
    }
  }
}
