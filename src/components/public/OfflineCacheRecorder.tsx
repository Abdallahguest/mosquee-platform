"use client"

import { useEffect } from "react"
import { saveMosqueSnapshot } from "@/lib/offline-cache"
import type {
  PrayerTimesSnapshot,
  AnnouncementSnapshot,
  EventSnapshot,
} from "@/lib/offline-cache"

interface OfflineCacheRecorderProps {
  slug: string
  name: string
  city: string | null
  schedule: PrayerTimesSnapshot
  announcements: AnnouncementSnapshot[]
  events: EventSnapshot[]
}

// Composant invisible : enregistre les données publiques de la mosquée dans
// localStorage à chaque visite EN LIGNE, pour réaffichage hors connexion.
// Ne rend rien à l'écran.
export default function OfflineCacheRecorder({
  slug,
  name,
  city,
  schedule,
  announcements,
  events,
}: OfflineCacheRecorderProps) {
  useEffect(() => {
    // On n'enregistre que si on est effectivement en ligne (sinon on
    // réécrirait un snapshot avec des données potentiellement vides).
    if (typeof navigator !== "undefined" && navigator.onLine === false) return

    saveMosqueSnapshot({ slug, name, city, schedule, announcements, events })
    // On ne dépend que du slug : un changement de mosquée déclenche un nouvel
    // enregistrement. Les données sont capturées au moment du rendu serveur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  return null
}
