import { requireSuperAdmin } from "@/lib/auth-helpers"
import { db } from "@/db/index"
import { mosques, announcements, events } from "@/db/schema"
import { eq, isNull, lt, desc } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Tableau de bord de santé : mosquées actives, horaires manquants, dernière activité.
// Permet de répondre à "combien de mosquées utilisent réellement la plateforme ?"

async function getHealthData() {
  const allMosques = await db.select().from(mosques).orderBy(mosques.name)

  // Mosquées sans aucun horaire saisi (aucun adhan renseigné)
  const noSchedule = allMosques.filter(
    (m) => !m.fajrAdhan && !m.dhuhrAdhan && !m.asrAdhan && !m.maghribAdhan && !m.ishaAdhan
  )

  // Mosquées sans annonce active
  const mosqueeIds = allMosques.map((m) => m.id)
  const now = new Date()

  const announcementCounts = await Promise.all(
    mosqueeIds.map(async (id) => {
      const [row] = await db
        .select({ id: announcements.id })
        .from(announcements)
        .where(eq(announcements.mosqueId, id))
        .limit(1)
      return { id, hasAnnouncement: !!row }
    })
  )

  const noAnnouncements = allMosques.filter(
    (m) => !announcementCounts.find((a) => a.id === m.id)?.hasAnnouncement
  )

  // Mosquées non vérifiées
  const unverified = allMosques.filter((m) => !m.isVerified)

  // 5 dernières mosquées créées
  const recent = [...allMosques]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return {
    total: allMosques.length,
    verified: allMosques.filter((m) => m.isVerified).length,
    noSchedule,
    noAnnouncements,
    unverified,
    recent,
  }
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

export default async function HealthPage() {
  await requireSuperAdmin()
  const data = await getHealthData()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tableau de bord santé</h1>
        <p className="text-gray-500 text-sm">Vue opérationnelle de la plateforme</p>
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Mosquées total", value: data.total, icon: "🕌" },
          { label: "Vérifiées", value: data.verified, icon: "✅" },
          { label: "Sans horaires", value: data.noSchedule.length, icon: "⚠️", warn: data.noSchedule.length > 0 },
          { label: "Non vérifiées", value: data.unverified.length, icon: "🔔", warn: data.unverified.length > 0 },
        ].map((k) => (
          <Card key={k.label} className={k.warn ? "border-amber-300" : ""}>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl mb-1" aria-hidden="true">{k.icon}</div>
              <div className={`text-2xl font-bold ${k.warn ? "text-amber-600" : "text-gray-900"}`}>{k.value}</div>
              <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mosquées sans horaires */}
      {data.noSchedule.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span aria-hidden="true">⚠️</span> Mosquées sans horaires saisis ({data.noSchedule.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {data.noSchedule.map((m) => (
                <li key={m.id} className="text-sm text-gray-700 flex items-center justify-between">
                  <span>{m.name} — {m.city}</span>
                  <Badge variant="outline" className="text-amber-600 border-amber-300">Sans horaire</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Mosquées sans annonces */}
      {data.noAnnouncements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span aria-hidden="true">📢</span> Mosquées sans annonce ({data.noAnnouncements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {data.noAnnouncements.map((m) => (
                <li key={m.id} className="text-sm text-gray-600">{m.name} — {m.city}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Dernières mosquées créées */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span aria-hidden="true">🕌</span> Dernières mosquées créées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.recent.map((m) => (
              <li key={m.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{m.name}</span>
                  <span className="text-gray-500 ml-2">{m.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  {m.isVerified && <Badge variant="secondary" className="text-xs">✓</Badge>}
                  <span className="text-xs text-gray-400">{formatDate(m.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
