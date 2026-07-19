"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/db/index"
import { eq } from "drizzle-orm"
import { users, mosques, mosqueAdmins, account } from "@/db/schema"
import { hashPassword } from "better-auth/crypto"
import { logAction, AUDIT_ACTIONS } from "@/lib/audit"

export type ActionResult<T = void> =
  | { success: true;  data: T;       error?: never }
  | { success: false; error: string; data?: never  }

// Schéma pour l'inscription self-service
const SelfServiceRegisterSchema = z.object({
  name: z.string().min(1, "Nom requis").max(100),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe : 8 caractères minimum"),
  // Informations de la mosquée
  mosqueName: z.string().min(1, "Nom de la mosquée requis").max(200),
  city: z.string().min(1, "Ville requise").max(100),
  country: z.string().min(1, "Pays requis").max(100),
  // Coordonnées GPS (optionnelles pour l'inscription, pourront être complétées après)
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
})

/**
 * Inscription self-service avec création automatique de mosquée en mode trial
 * Modèle C hybride : inscription publique mais avec workflow de validation
 */
export async function selfServiceRegister(formData: FormData): Promise<ActionResult<{ email: string; mosqueSlug: string }>> {
  const parsed = SelfServiceRegisterSchema.safeParse({
    name: formData.get("name"),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: formData.get("password"),
    mosqueName: formData.get("mosqueName"),
    city: formData.get("city"),
    country: formData.get("country"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  try {
    // Vérifier si l'email existe déjà
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1)

    if (existingUser) {
      return { success: false, error: "Un compte existe déjà avec cet email." }
    }

    // Générer un slug unique pour la mosquée
    const baseSlug = parsed.data.mosqueName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    
    let slug = baseSlug
    let counter = 1
    
    while (true) {
      const [existingMosque] = await db
        .select({ id: mosques.id })
        .from(mosques)
        .where(eq(mosques.slug, slug))
        .limit(1)
      
      if (!existingMosque) break
      
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Créer l'utilisateur
    const userId = crypto.randomUUID()
    const hashedPassword = await hashPassword(parsed.data.password)

    await db.insert(users).values({
      id: userId,
      name: parsed.data.name,
      email: parsed.data.email,
      emailVerified: false, // Doit être vérifié par email
      role: "admin",
      isPendingSetup: true, // Marquer comme en attente de setup
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Créer le compte Better-Auth dans la table account
    await db.insert(account).values({
      id: crypto.randomUUID(),
      userId,
      accountId: parsed.data.email,
      providerId: "credential",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Créer la mosquée en mode trial
    const trialEndsAt = new Date()
    trialEndsAt.setMonth(trialEndsAt.getMonth() + 3) // 3 mois de trial

    const [mosque] = await db.insert(mosques).values({
      slug,
      name: parsed.data.mosqueName,
      city: parsed.data.city,
      country: parsed.data.country,
      latitude: parsed.data.latitude ?? 0,
      longitude: parsed.data.longitude ?? 0,
      timezone: "Africa/Conakry",
      isVerified: false,
      trialEndsAt,
      paidUntil: null,
      subscriptionStatus: "trial",
      createdAt: new Date(),
    }).returning()

    // Lier l'utilisateur à la mosquée
    await db.insert(mosqueAdmins).values({
      mosqueId: mosque.id,
      userId,
      createdAt: new Date(),
    })

    // Logger l'action
    await logAction({
      userId,
      mosqueId: mosque.id,
      action: AUDIT_ACTIONS.SELF_SERVICE_REGISTER,
      targetId: `user:${userId}`,
      details: `Self-service registration: ${parsed.data.email} created mosque ${slug}`,
    })

    await logAction({
      userId,
      mosqueId: mosque.id,
      action: AUDIT_ACTIONS.SELF_SERVICE_MOSQUE_CREATE,
      targetId: `mosque:${mosque.id}`,
      details: `Mosque ${slug} created in trial mode`,
    })

    // Déclencher l'envoi d'email de vérification via Better-Auth
    // Note : Better-Auth enverra automatiquement l'email de vérification
    // grâce à la configuration emailVerification.sendOnSignUp: true

    revalidatePath("/")
    return { success: true, data: { email: parsed.data.email, mosqueSlug: slug } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error && error.message.toLowerCase().includes("exist")
        ? "Un compte existe déjà avec cet email."
        : "Erreur lors de l'inscription. Veuillez réessayer.",
    }
  }
}

/**
 * Complète le setup initial après vérification email
 * Marque le compte comme actif et redirige vers l'admin
 */
export async function completeSetup(): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session) {
    return { success: false, error: "Non authentifié" }
  }

  const user = session.user as { id: string; isPendingSetup?: boolean }

  try {
    if (user.isPendingSetup) {
      await db.update(users)
        .set({ isPendingSetup: false })
        .where(eq(users.id, user.id))
    }

    revalidatePath("/admin")
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: "Erreur lors de la finalisation du setup." }
  }
}
