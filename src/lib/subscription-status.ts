// Module pur — pas de "use server", pas de dépendances DB.
// Importable depuis auth-helpers.ts, les pages Server Components,
// et n'importe quel contexte (Edge Runtime inclus).
//
// computeSubscriptionStatus calcule le statut effectif d'une mosquée
// en fonction de ses dates — sans accès à la base de données.

export type SubscriptionStatus = "trial" | "active" | "expired" | "suspended" | "expiring_soon"

export function computeSubscriptionStatus(mosque: {
  subscriptionStatus: string
  trialEndsAt:        Date | null
  paidUntil:          Date | null
}): SubscriptionStatus {
  if (mosque.subscriptionStatus === "suspended") return "suspended"

  const now = new Date()
  const sevenDays = new Date(now.getTime() + 7 * 24 * 3600 * 1000)

  // Payé et à jour
  if (mosque.paidUntil && mosque.paidUntil > now) {
    if (mosque.paidUntil <= sevenDays) return "expiring_soon"
    return "active"
  }

  // En période d'essai
  if (mosque.trialEndsAt && mosque.trialEndsAt > now) {
    if (mosque.trialEndsAt <= sevenDays) return "expiring_soon"
    return "trial"
  }

  return "expired"
}
