"use client"

import { useEffect, useState } from "react"
import { getAllSnapshots } from "@/lib/offline-cache"
import type { MosqueSnapshot, PrayerTimesSnapshot } from "@/lib/offline-cache"

// Page de repli hors-ligne AUTONOME (rend son propre html/body, styles inline).
// Affiche les dernières données connues des mosquées consultées + une note
// explicative (anti-jahàla : l'utilisateur comprend pourquoi il est ici).

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
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })
  } catch {
    return iso
  }
}

function timeFor(schedule: PrayerTimesSnapshot, key: string, suffix: "Adhan" | "Iqama"): string | null {
  const field = `${key}${suffix}` as keyof PrayerTimesSnapshot
  return schedule[field] ?? null
}

const S = {
  body: { margin: 0, background: "#f9fafb", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: "#1f2937", minHeight: "100vh" } as React.CSSProperties,
  wrap: { maxWidth: 520, margin: "0 auto", padding: "24px 24px 40px" } as React.CSSProperties,
  center: { textAlign: "center" as const, marginBottom: 20 },
  h1: { fontSize: 20, fontWeight: 700, margin: "8px 0 4px" } as React.CSSProperties,
  sub: { fontSize: 14, color: "#6b7280", margin: 0 } as React.CSSProperties,
  // Note explicative (pourquoi cette page s'affiche)
  note: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 14px", margin: "0 0 20px", fontSize: 13, color: "#92400e", lineHeight: 1.5 } as React.CSSProperties,
  backBtn: { display: "inline-block", marginTop: 10, background: "#15803d", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", borderRadius: 8, padding: "8px 16px" } as React.CSSProperties,
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 20 } as React.CSSProperties,
  name: { fontSize: 16, fontWeight: 700, margin: 0 } as React.CSSProperties,
  city: { fontSize: 12, color: "#6b7280", margin: "2px 0 0" } as React.CSSProperties,
  badge: { fontSize: 11, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "3px 8px", marginTop: 8, display: "inline-block" } as React.CSSProperties,
  sectionTitle: { fontSize: 13, fontWeight: 600, color: "#374151", margin: "12px 0 8px", borderTop: "1px solid #f3f4f6", paddingTop: 12 } as React.CSSProperties,
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, padding: "2px 0" } as React.CSSProperties,
  time: { fontWeight: 600, direction: "ltr" as const },
  appel: { fontSize: 12, color: "#9ca3af", marginLeft: 8 } as React.CSSProperties,
  li: { fontSize: 14, color: "#374151", margin: "2px 0", listStyle: "none" } as React.CSSProperties,
  ul: { margin: 0, padding: 0 } as React.CSSProperties,
}

function Content() {
  const [snapshots, setSnapshots] = useState<MosqueSnapshot[] | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSnapshots(getAllSnapshots())
  }, [])

  if (snapshots === null) {
    return <div style={{ ...S.wrap, textAlign: "center" }}><p style={S.sub}>Chargement…</p></div>
  }

  if (snapshots.length === 0) {
    return (
      <div style={{ ...S.wrap, textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden="true">🕌</div>
        <h1 style={S.h1}>Vous êtes hors connexion</h1>
        <p style={{ ...S.sub, maxWidth: 360, margin: "0 auto" }}>
          La page demandée n&apos;est pas disponible hors connexion, et aucune
          mosquée n&apos;a encore été consultée. Reconnectez-vous une fois pour
          accéder ensuite aux horaires hors connexion.
        </p>
      </div>
    )
  }

  // Mosquée la plus récemment consultée → cible du bouton "Retour".
  const recent = snapshots[0]

  return (
    <div style={S.wrap}>
      <div style={S.center}>
        <div style={{ fontSize: 36, marginBottom: 8 }} aria-hidden="true">🕌</div>
        <h1 style={S.h1}>Mode hors connexion</h1>
        <p style={S.sub}>Voici les dernières informations enregistrées sur votre appareil.</p>
      </div>

      {/* Note explicative : pourquoi l'utilisateur voit cette page */}
      <div style={S.note}>
        La page que vous avez demandée n&apos;est pas disponible sans connexion.
        En attendant le retour du réseau, voici les dernières informations
        enregistrées lors de votre dernière visite.
        <br />
        <a href={`/m/${recent.slug}`} style={S.backBtn}>← Retour à {recent.name}</a>
      </div>

      {snapshots.map((m) => (
        <section key={m.slug} style={S.card}>
          <div>
            <h2 style={S.name}>{m.name}</h2>
            {m.city && <p style={S.city}>{m.city}</p>}
            <p style={S.badge}>Enregistré le {formatSavedAt(m.savedAt)} · reconnectez-vous pour vérifier</p>
          </div>

          <div>
            <h3 style={S.sectionTitle}>Horaires de prière</h3>
            <div>
              {PRAYERS.map((p) => {
                const iqama = timeFor(m.schedule, p.key, "Iqama")
                const adhan = timeFor(m.schedule, p.key, "Adhan")
                if (!iqama && !adhan) return null
                return (
                  <div key={p.key} style={S.row}>
                    <span>{p.label}</span>
                    <span style={S.time}>
                      {iqama || adhan}
                      {adhan && iqama && <span style={S.appel}>appel {adhan}</span>}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {m.announcements.length > 0 && (
            <div>
              <h3 style={S.sectionTitle}>Annonces</h3>
              <ul style={S.ul}>
                {m.announcements.map((a) => <li key={a.id} style={S.li}>{a.title}</li>)}
              </ul>
            </div>
          )}

          {m.events.length > 0 && (
            <div>
              <h3 style={S.sectionTitle}>Événements</h3>
              <ul style={S.ul}>
                {m.events.map((ev) => <li key={ev.id} style={S.li}>{ev.title}</li>)}
              </ul>
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

export default function OfflinePage() {
  return (
    <html lang="fr">
      <body style={S.body}>
        <Content />
      </body>
    </html>
  )
}
