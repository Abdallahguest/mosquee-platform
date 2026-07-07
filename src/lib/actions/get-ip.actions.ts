"use server"

import { headers } from "next/headers"

// Récupère l'IP du client depuis les headers (disponible côté serveur uniquement).
// Utilisé pour enrichir les logs de connexion — jamais stocké ailleurs.
export async function getClientIp(): Promise<string | null> {
  const h = await headers()
  return (
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  )
}
