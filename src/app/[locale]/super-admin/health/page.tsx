import { requireSuperAdmin } from "@/lib/auth-helpers"
import { db } from "@/db/index"
import { mosques, announcements, auditLog, session as sessionTable } from "@/db/schema"
import { eq, desc, and, gte } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

async function getHealthData() {
  const allMosques = await db.select().from(mosques).orderBy(mosques.name)
  const now = new Date()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 3600 * 1000)

  // Mosquées sans horaires
  const noSchedule = allMosques.filter(
    (m) =>
      !m.fajrAdhan && !m.fajrIqama &&
      !m.dhuhrAdhan && !m.dhuhrIqama &&
      !m.asrAdhan && !m.asrIqama &&
      !m.maghribAdhan && !m.maghribIqama &&
      !m.ishaAdhan && !m.ishaIqama
  )

  // Mosquées sans annonce
  const announcementCounts = await Promise.all(
    allMosques.map(async (m) => {
      const [row] = await db.select({ id: announcements.id }).from(announcements)
        .where(eq(announcements.mosqueId, m.id)).limit(1)
      return { id: m.id, hasAnnouncement: !!row }
    })
  )
  const noAnnouncements = allMosques.filter(
    (m) => !announcementCounts.find((a) => a.id === m.id)?.hasAnnouncement
  )

  // Dernière connexion par mosquée via audit_log (auth.sign_in_success)
  // + dernière activité (toute action sauf connexion)
  const lastActivityPerMosque = await Promise.all(
    allMosques.map(async (m) => {
      // Dernière action admin (hors connexion)
      const [lastAction] = await db
        .select({ createdAt: auditLog.createdAt, action: auditLog.action, userName: auditLog.userId })
        .from(auditLog)
        .where(eq(auditLog.mosqueId, m.id))
        .orderBy(desc(auditLog.createdAt))
        .limit(1)

      // Inactive depuis > 14 jours ?
      const inactive = !lastAction || new Date(lastAction.createdAt) < fourteenDaysAgo

      return { id: m.id, lastAction: lastAction ?? null, inactive }
    })
  )

  // Mosquées inactives (créées il y a plus de 3 jours ET aucune action depuis 14j)
  const inactive = allMosques.filter((m) => {
    const mosqueAge = now.getTime() - new Date(m.createdAt).getTime()
    const tooNew = mosqueAge < 3 * 24 * 3600 * 1000
    if (tooNew) return false
    return lastActivityPerMosque.find((a) => a.id === m.id)?.inactive ?? true
  })

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
    inactive,
    unverified,
    recent,
    lastActivityPerMosque,
  }
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

function formatDateTime(d: Date | string) {
  return new Date(d).toLocaleString("fr-FR", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  })
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

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Mosquées total",  value: data.total,               icon: "🕌", warn: false },
          { label: "Vérifiées",       value: data.verified,             icon: "✅", warn: false },
          { label: "Sans horaires",   value: data.noSchedule.length,    icon: "⚠️", warn: data.noSchedule.length > 0 },
          { label: "Inactives +14j",  value: data.inactive.length,      icon: "😴", warn: data.inactive.length > 0 },
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

      {/* Alerte inactivité 14 jours */}
      {data.inactive.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-800">
              <span aria-hidden="true">😴</span>
              Mosquées sans activité depuis +14 jours ({data.inactive.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-amber-700 mb-3">
              Ces mosquées ont un compte mais n'ont effectué aucune action depuis au moins 14 jours. Relancer leur admin.
            </p>
            <ul className="space-y-1">
              {data.inactive.map((m) => {
                const activity = data.lastActivityPerMosque.find((a) => a.id === m.id)
                return (
                  <li key={m.id} className="text-sm text-amber-800 flex items-center justify-between">
                    <span className="font-medium">{m.name} — {m.city}</span>
                    <span className="text-xs opacity-70">
                      {activity?.lastAction
                        ? `Dernière action : ${formatDateTime(activity.lastAction.createdAt)}`
                        : "Jamais utilisé"}
                    </span>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

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

      {/* Dernières mosquées créées + dernière activité */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span aria-hidden="true">🕌</span> Dernières mosquées créées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.recent.map((m) => {
              const activity = data.lastActivityPerMosque.find((a) => a.id === m.id)
              return (
                <li key={m.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                  <div>
                    <span className="font-medium">{m.name}</span>
                    <span className="text-gray-500 ml-2">{m.city}</span>
                    {m.isVerified && <Badge variant="secondary" className="text-xs ml-2">✓</Badge>}
                  </div>
                  <div className="flex flex-col sm:items-end gap-0.5">
                    <span className="text-xs text-gray-400">Créée le {formatDate(m.createdAt)}</span>
                    {activity?.lastAction ? (
                      <span className="text-xs text-green-600">
                        Dernière activité : {formatDateTime(activity.lastAction.createdAt)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Jamais utilisée</span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
