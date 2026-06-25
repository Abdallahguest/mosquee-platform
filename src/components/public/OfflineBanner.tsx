"use client"

import { useEffect, useState } from "react"

// Bannière globale affichée quand l'appareil est hors connexion.
// Prévient l'utilisateur que seules les pages déjà consultées sont disponibles.
// À placer dans le layout pour couvrir toute l'application.
export default function OfflineBanner() {
  // On démarre à `null` pour éviter tout décalage d'hydratation : on ne connaît
  // l'état réseau qu'une fois monté côté client.
  const [online, setOnline] = useState<boolean | null>(null)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    update() // état initial au montage

    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  // En ligne (ou état pas encore connu) : rien à afficher.
  if (online === null || online === true) return null

  return (
    <div
      role="status"
      className="sticky top-0 z-50 bg-amber-100 border-b border-amber-200 text-amber-800 text-xs text-center px-4 py-2"
    >
      Vous êtes hors connexion · seules les pages déjà consultées sont disponibles
    </div>
  )
}
