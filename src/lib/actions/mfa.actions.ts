"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireSession } from "@/lib/auth-helpers"
import { db } from "@/db/index"
import { eq } from "drizzle-orm"
import { users } from "@/db/schema"
import { generateTOTPSecret, verifyTOTPCode, verifyRecoveryCode } from "@/lib/mfa"
import { logAction, AUDIT_ACTIONS } from "@/lib/audit"

export type ActionResult<T = void> =
  | { success: true;  data: T;       error?: never }
  | { success: false; error: string; data?: never  }

/**
 * Génère un nouveau secret TOTP pour l'utilisateur connecté
 */
export async function setupTOTP(): Promise<ActionResult<{ secret: string; qrCodeUrl: string; recoveryCodes: string[] }>> {
  const session = await requireSession()
  const user = session.user as { id: string; email: string; role?: string }

  // Seuls les super-admins peuvent activer MFA
  if (user.role !== "super_admin") {
    return { success: false, error: "MFA is only available for super-admins." }
  }

  try {
    const { secret, qrCodeUrl, recoveryCodes } = generateTOTPSecret(user.email)

    // Stocker temporairement le secret sans activer MFA (l'utilisateur doit confirmer avec un code)
    await db.update(users)
      .set({ 
        totpSecret: secret,
        recoveryCodes: JSON.stringify(recoveryCodes),
        totpEnabled: false, // Pas encore activé
      })
      .where(eq(users.id, user.id))

    await logAction({
      userId: user.id,
      action: AUDIT_ACTIONS.MFA_SETUP_INITIATED,
      details: "TOTP setup initiated",
    })

    return { success: true, data: { secret, qrCodeUrl, recoveryCodes } }
  } catch (error) {
    return { success: false, error: "Failed to setup TOTP." }
  }
}

/**
 * Confirme et active MFA avec un code TOTP valide
 */
const ConfirmTOTPSchema = z.object({
  token: z.string().min(6, "Code must be 6 digits").max(6),
})

export async function confirmTOTP(formData: FormData): Promise<ActionResult> {
  const session = await requireSession()
  const user = session.user as { id: string; role?: string; totpSecret?: string | null }

  if (user.role !== "super_admin") {
    return { success: false, error: "MFA is only available for super-admins." }
  }

  const parsed = ConfirmTOTPSchema.safeParse({
    token: formData.get("token"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid code" }
  }

  if (!user.totpSecret) {
    return { success: false, error: "TOTP not setup. Please initiate setup first." }
  }

  try {
    const isValid = verifyTOTPCode(user.totpSecret, parsed.data.token)

    if (!isValid) {
      return { success: false, error: "Invalid code. Please try again." }
    }

    // Activer MFA
    await db.update(users)
      .set({ totpEnabled: true })
      .where(eq(users.id, user.id))

    await logAction({
      userId: user.id,
      action: AUDIT_ACTIONS.MFA_ENABLED,
      details: "TOTP MFA enabled",
    })

    revalidatePath("/admin/profile")
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: "Failed to confirm TOTP." }
  }
}

/**
 * Désactive MFA pour l'utilisateur connecté
 */
export async function disableTOTP(): Promise<ActionResult> {
  const session = await requireSession()
  const user = session.user as { id: string; role?: string }

  if (user.role !== "super_admin") {
    return { success: false, error: "MFA is only available for super-admins." }
  }

  try {
    await db.update(users)
      .set({ 
        totpSecret: null,
        totpEnabled: false,
        recoveryCodes: null,
      })
      .where(eq(users.id, user.id))

    await logAction({
      userId: user.id,
      action: AUDIT_ACTIONS.MFA_DISABLED,
      details: "TOTP MFA disabled",
    })

    revalidatePath("/admin/profile")
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: "Failed to disable TOTP." }
  }
}

/**
 * Met à jour l'email d'urgence pour la récupération de compte
 */
const EmergencyEmailSchema = z.object({
  emergencyEmail: z.string().email("Invalid email").optional(),
})

export async function updateEmergencyEmail(formData: FormData): Promise<ActionResult> {
  const session = await requireSession()
  const user = session.user as { id: string; role?: string }

  if (user.role !== "super_admin") {
    return { success: false, error: "Emergency email is only for super-admins." }
  }

  const parsed = EmergencyEmailSchema.safeParse({
    emergencyEmail: formData.get("emergencyEmail"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid email" }
  }

  try {
    await db.update(users)
      .set({ emergencyEmail: parsed.data.emergencyEmail || null })
      .where(eq(users.id, user.id))

    await logAction({
      userId: user.id,
      action: AUDIT_ACTIONS.EMERGENCY_EMAIL_UPDATED,
      details: parsed.data.emergencyEmail || "Emergency email removed",
    })

    revalidatePath("/admin/profile")
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: "Failed to update emergency email." }
  }
}
