"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/db/index"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { requireSession } from "@/lib/auth-helpers"
import type { ActionResult } from "./action-result"

const UpdateProfileSchema = z.object({
  name: z.string().min(1, "NOM_REQUIS").max(100, "NOM_TROP_LONG"),
})

export async function updateProfileName(formData: FormData): Promise<ActionResult> {
  const session = await requireSession()

  const parsed = UpdateProfileSchema.safeParse({ name: formData.get("name") })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  try {
    await db.update(users).set({ name: parsed.data.name }).where(eq(users.id, session.user.id))
    revalidatePath("/admin")
    revalidatePath("/admin/profile")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour du nom." }
  }
}

export async function updateProfilePassword(formData: FormData): Promise<ActionResult> {
  await requireSession()

  const currentPassword = formData.get("currentPassword") as string
  const newPassword     = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "Tous les champs sont requis." }
  }
  if (newPassword.length < 8) {
    return { success: false, error: "Le nouveau mot de passe doit contenir au moins 8 caractères." }
  }
  if (newPassword !== confirmPassword) {
    return { success: false, error: "Les mots de passe ne correspondent pas." }
  }

  try {
    // Better-Auth changePassword — vérifie l'ancien mot de passe automatiquement
    const result = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      },
      headers: await headers(),
    })

    if (!result) {
      return { success: false, error: "Mot de passe actuel incorrect." }
    }

    revalidatePath("/admin/profile")
    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error && error.message.includes("Invalid")
        ? "Mot de passe actuel incorrect."
        : "Erreur lors du changement de mot de passe.",
    }
  }
}
