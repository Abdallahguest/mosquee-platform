"use server"
"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { db } from "@/db/index"
import { mosques, payments } from "@/db/schema"
import { eq } from "drizzle-orm"
import { logAction } from "@/lib/audit"
import type { ActionResult } from "./action-result"

// ─────────────────────────────────────────────────────────────
// subscription.actions.ts — Gestion des abonnements
//
// Toutes les décisions de paiement sont prises par le super-admin.
// Pas d'automatisme — anti-gharar : aucune suspension sans décision humaine.
// Chaque action est tracée dans audit_log.
// ─────────────────────────────────────────────────────────────

const RenewSchema = z.object({
  mosqueId: z.number().int().positive(),
  months:   z.number().int().min(1).max(12),
  amountGNF: z.number().int().min(0),
  paymentMethod: z.enum(["cash", "orange_money"]),
  note: z.string().max(200).optional(),
})

// Enregistre un paiement et prolonge l'abonnement.
// paidUntil est calculé depuis aujourd'hui (ou depuis paidUntil actuel si encore valide).
export async function renewSubscription(formData: FormData): Promise<ActionResult> {
  const session = await requireSuperAdmin()

  const parsed = RenewSchema.safeParse({
    mosqueId:      Number(formData.get("mosqueId")),
    months:        Number(formData.get("months")),
    amountGNF:     Number(formData.get("amountGNF")),
    paymentMethod: formData.get("paymentMethod"),
    note:          formData.get("note") || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const [mosque] = await db
    .select({ id: mosques.id, name: mosques.name, paidUntil: mosques.paidUntil })
    .from(mosques)
    .where(eq(mosques.id, parsed.data.mosqueId))
    .limit(1)

  if (!mosque) return { success: false, error: "Mosquée introuvable." }

  const now = new Date()
  // Si le paidUntil actuel est dans le futur, on prolonge depuis là.
  // Sinon on part d'aujourd'hui. Anti-gharar : pas de jours perdus.
  const base = mosque.paidUntil && mosque.paidUntil > now ? mosque.paidUntil : now
  const newPaidUntil = new Date(base)
  newPaidUntil.setMonth(newPaidUntil.getMonth() + parsed.data.months)

  try {
    await db
      .update(mosques)
      .set({
        paidUntil:          newPaidUntil,
        subscriptionStatus: "active",
      })
      .where(eq(mosques.id, parsed.data.mosqueId))

    // Enregistrer dans la table payments (historique structuré)
    await db.insert(payments).values({
      mosqueId:      parsed.data.mosqueId,
      recordedBy:    session.user.id,
      amountGNF:     parsed.data.amountGNF,
      months:        parsed.data.months,
      paymentMethod: parsed.data.paymentMethod,
      periodStart:   base,
      periodEnd:     newPaidUntil,
      note:          parsed.data.note ?? null,
    })

    revalidatePath("/super-admin/subscriptions")
    revalidatePath("/super-admin")

    const methodLabel = parsed.data.paymentMethod === "cash" ? "espèces" : "Orange Money"
    await logAction({
      userId:   session.user.id,
      mosqueId: parsed.data.mosqueId,
      action:   "subscription.renew",
      targetId: `mosque:${parsed.data.mosqueId}`,
      details:  `${parsed.data.months} mois · ${parsed.data.amountGNF} GNF · ${methodLabel}${parsed.data.note ? ` · ${parsed.data.note}` : ""}`,
    })

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de l'enregistrement du paiement." }
  }
}

// Suspend manuellement un abonnement (décision du super-admin).
// Anti-jahàla : la mosquée verra un message clair expliquant la situation.
export async function suspendSubscription(mosqueId: number): Promise<ActionResult> {
  const session = await requireSuperAdmin()

  const [mosque] = await db
    .select({ id: mosques.id, name: mosques.name })
    .from(mosques)
    .where(eq(mosques.id, mosqueId))
    .limit(1)

  if (!mosque) return { success: false, error: "Mosquée introuvable." }

  try {
    await db
      .update(mosques)
      .set({ subscriptionStatus: "suspended" })
      .where(eq(mosques.id, mosqueId))

    revalidatePath("/super-admin/subscriptions")
    await logAction({
      userId:   session.user.id,
      mosqueId,
      action:   "subscription.suspend",
      targetId: `mosque:${mosqueId}`,
      details:  mosque.name,
    })

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la suspension." }
  }
}

// Réactive un abonnement suspendu (sans paiement — pour corriger une erreur).
export async function reactivateSubscription(mosqueId: number): Promise<ActionResult> {
  const session = await requireSuperAdmin()

  const [mosque] = await db
    .select({ id: mosques.id, paidUntil: mosques.paidUntil })
    .from(mosques)
    .where(eq(mosques.id, mosqueId))
    .limit(1)

  if (!mosque) return { success: false, error: "Mosquée introuvable." }

  const now = new Date()
  const newStatus = mosque.paidUntil && mosque.paidUntil > now ? "active" : "expired"

  try {
    await db
      .update(mosques)
      .set({ subscriptionStatus: newStatus })
      .where(eq(mosques.id, mosqueId))

    revalidatePath("/super-admin/subscriptions")
    await logAction({
      userId:   session.user.id,
      mosqueId,
      action:   "subscription.reactivate",
      targetId: `mosque:${mosqueId}`,
    })

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la réactivation." }
  }
}
