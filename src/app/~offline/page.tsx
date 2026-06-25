"use client"

import { useEffect, useState } from "react"
import { getAllSnapshots } from "@/lib/offline-cache"
import type { MosqueSnapshot, PrayerTimesSnapshot } from "@/lib/offline-cache"

// Page de repli hors-ligne INTELLIGENTE.
// Au lieu d'un simple « vous êtes hors connexion », elle lit le cache local
// (rempli lors des visites en ligne) et affiche les derniers horaires connus,
// annonces et événements de chaque mosquée consultée.
//
// Anti-gharar : la date d'enregistrement est affichée clairement. L'utilisateur
// sait que ce sont les dernières données CONNUES, pas du temps réel.

const PRAYERS: { key: string; label: string }[] = [
  { key: "fajr", label: "Fajr" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha'" },
  { key: "jumua", label: "Jumu'ah" },
]

function formatSavedAt(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

// Accès typé à une heure de prière dans le snapshot, sans cast risqué.
function timeFor(schedule: PrayerTimesSnapshot, key: string, suffix: "Adhan" | "Iqama"): string | null {
  const field = `${key}${suffix}` as keyof PrayerTimesSnapshot
  return schedule[field] ?? null
}

export default function OfflinePage() {
  // Lecture du cache localStorage. On démarre à `null` (côté serveur, pas de
  // localStorage) puis on charge au montage côté client.
  const [snapshots, setSnapshots] = useState<MosqueSnapshot[] | null>(null)

  useEffect(() => {
    // Lecture unique au montage, côté client uniquement (localStorage n'existe
    // pas côté serveur). C'est l'usage légitime d'un effect : synchroniser avec
    // un store externe au navigateur.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSnapshots(getAllSnapshots())
  }, [])

  // État de chargement (très bref, lecture localStorage).
  if (snapshots === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Chargement…</p>
      </div>
    )
  }

  // Aucune donnée en cache : message simple.
  if (snapshots.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div className="text-5xl mb-6" aria-hidden="true">🕌</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Vous êtes hors connexion</h1>
        <p className="text-sm text-gray-600 max-w-sm">
          Aucune mosquée n&apos;a encore été consultée. Reconnectez-vous une fois
          pour pouvoir accéder aux horaires hors connexion par la suite.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-6 py-8 space-y-8">

        <div className="text-center">
          <div className="text-4xl mb-2" aria-hidden="true">🕌</div>
          <h1 className="text-xl font-bold text-gray-900">Mode hors connexion</h1>
          <p className="text-sm text-gray-500 mt-1">
            Voici les dernières informations enregistrées sur votre appareil.
          </p>
        </div>

        {snapshots.map((m) => (
          <section key={m.slug} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="font-bold text-gray-900">{m.name}</h2>
              {m.city && <p className="text-xs text-gray-500">{m.city}</p>}
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-1 mt-2 inline-block">
                Enregistré le {formatSavedAt(m.savedAt)} · reconnectez-vous pour vérifier
              </p>
            </div>

            {/* Horaires */}
            <div className="border-t border-gray-100 pt-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Horaires de prière</h3>
              <div className="space-y-1">
                {PRAYERS.map((p) => {
                  const iqama = timeFor(m.schedule, p.key, "Iqama")
                  const adhan = timeFor(m.schedule, p.key, "Adhan")
                  if (!iqama && !adhan) return null
                  return (
                    <div key={p.key} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{p.label}</span>
                      <span className="font-medium text-gray-900" dir="ltr">
                        {iqama || adhan}
                        {adhan && iqama && (
                          <span className="text-xs text-gray-400 ml-2">appel {adhan}</span>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Annonces */}
            {m.announcements.length > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Annonces</h3>
                <ul className="space-y-1">
                  {m.announcements.map((a) => (
                    <li key={a.id} className="text-sm text-gray-700">{a.title}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Événements */}
            {m.events.length > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Événements</h3>
                <ul className="space-y-1">
                  {m.events.map((ev) => (
                    <li key={ev.id} className="text-sm text-gray-700">{ev.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}

      </div>
    </div>
  )
}
