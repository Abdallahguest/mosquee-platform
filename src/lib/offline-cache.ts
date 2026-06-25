// Cache hors-ligne léger basé sur localStorage.
// On stocke un instantané (snapshot) des données publiques de chaque mosquée
// consultée EN LIGNE, pour pouvoir les réafficher hors connexion.
//
// Pourquoi localStorage et pas le cache du service worker : les pages Next.js
// App Router sont rendues serveur et ne se mettent pas en cache de façon fiable
// pour l'offline. Stocker les DONNÉES (et non la page) est simple et robuste.
//
// Anti-gharar : chaque snapshot porte sa date d'enregistrement (savedAt), pour
// que l'utilisateur sache que ce sont les derniers horaires CONNUS, pas du
// temps réel.

const PREFIX = "amana:mosque:"
const INDEX_KEY = "amana:mosques-index"

export interface PrayerTimesSnapshot {
  fajrAdhan: string | null
  fajrIqama: string | null
  dhuhrAdhan: string | null
  dhuhrIqama: string | null
  asrAdhan: string | null
  asrIqama: string | null
  maghribAdhan: string | null
  maghribIqama: string | null
  ishaAdhan: string | null
  ishaIqama: string | null
  jumuaAdhan: string | null
  jumuaIqama: string | null
}

export interface AnnouncementSnapshot {
  id: number
  title: string
  publishedAt: string | null
}

export interface EventSnapshot {
  id: number
  title: string
  startAt: string
  location: string | null
}

export interface MosqueSnapshot {
  slug: string
  name: string
  city: string | null
  schedule: PrayerTimesSnapshot
  announcements: AnnouncementSnapshot[]
  events: EventSnapshot[]
  savedAt: string // ISO date
}

// Vérifie la disponibilité de localStorage (peut être absent/bloqué).
function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage
  } catch {
    return false
  }
}

// Enregistre l'instantané d'une mosquée et met à jour l'index.
export function saveMosqueSnapshot(snapshot: Omit<MosqueSnapshot, "savedAt">): void {
  if (!hasStorage()) return
  try {
    const full: MosqueSnapshot = { ...snapshot, savedAt: new Date().toISOString() }
    localStorage.setItem(PREFIX + snapshot.slug, JSON.stringify(full))

    // Mettre à jour l'index des slugs consultés (le plus récent en tête).
    const index = listCachedSlugs().filter((s) => s !== snapshot.slug)
    index.unshift(snapshot.slug)
    localStorage.setItem(INDEX_KEY, JSON.stringify(index.slice(0, 20)))
  } catch {
    // Quota dépassé ou stockage indisponible : on échoue silencieusement.
  }
}

// Liste les slugs des mosquées en cache (du plus récent au plus ancien).
export function listCachedSlugs(): string[] {
  if (!hasStorage()) return []
  try {
    const raw = localStorage.getItem(INDEX_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

// Récupère l'instantané d'une mosquée.
export function getMosqueSnapshot(slug: string): MosqueSnapshot | null {
  if (!hasStorage()) return null
  try {
    const raw = localStorage.getItem(PREFIX + slug)
    return raw ? (JSON.parse(raw) as MosqueSnapshot) : null
  } catch {
    return null
  }
}

// Récupère tous les instantanés en cache (pour la page hors-ligne).
export function getAllSnapshots(): MosqueSnapshot[] {
  return listCachedSlugs()
    .map((slug) => getMosqueSnapshot(slug))
    .filter((s): s is MosqueSnapshot => s !== null)
}
