import { getTranslations, getLocale } from "next-intl/server"
import { getSessionMosque } from "@/lib/auth-helpers"
import { getRecentAuditLog } from "@/db/queries"
import NoMosque from "@/components/admin/NoMosque"

function formatDate(date: Date | string, locale: string) {
  return new Date(date).toLocaleString(locale, {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  })
}

// Mapping statique — next-intl ne résout pas les clés dynamiques imbriquées.
// Les emojis donnent une lecture instantanée de l'action.
const ACTION_LABELS: Record<string, string> = {
  "announcement.create":    "📢 Annonce créée",
  "announcement.update":    "📢 Annonce modifiée",
  "announcement.delete":    "🗑 Annonce supprimée",
  "announcement.publish":   "✅ Annonce publiée",
  "announcement.unpublish": "⏸ Annonce dépubliée",
  "announcement.pin":       "📌 Annonce épinglée",
  "announcement.unpin":     "📌 Annonce désépinglée",
  "event.create":           "📅 Événement créé",
  "event.update":           "📅 Événement modifié",
  "event.delete":           "🗑 Événement supprimé",
  "member.create":          "👤 Membre ajouté",
  "member.update":          "👤 Membre modifié",
  "member.delete":          "🗑 Membre supprimé",
  "settings.update":        "⚙️ Paramètres modifiés",
  "prayer_times.update":    "🕌 Horaires modifiés",
  "admin.assign":           "🔗 Admin assigné",
  "admin.remove":           "❌ Admin retiré",
  "mosque.create":          "🕌 Mosquée créée",
  "mosque.update":          "🕌 Mosquée modifiée",
  "mosque.delete":          "🗑 Mosquée supprimée",
  "user.create":            "👤 Compte créé",
  "user.update":            "👤 Compte modifié",
  "user.delete":            "🗑 Compte supprimé",
  "auth.sign_in_success":   "✅ Connexion réussie",
  "auth.sign_in_failed":    "⚠️ Tentative de connexion échouée",
}

export default async function ActivityPage() {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return <NoMosque />

  const t      = await getTranslations("admin.activityPage")
  const locale = await getLocale()
  const logs   = await getRecentAuditLog(mosqueId, 30)

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("title")}</h1>
        <p className="text-gray-500 text-sm">{t("subtitle")}</p>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4" aria-hidden="true">📋</div>
          <p className="text-base font-medium text-gray-700">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {ACTION_LABELS[log.action] ?? log.action}
                </p>
                {log.details && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{log.details}</p>
                )}
              </div>
              <time
                className="text-xs text-gray-400 whitespace-nowrap mt-0.5 shrink-0"
                dateTime={new Date(log.createdAt).toISOString()}
              >
                {formatDate(log.createdAt, locale)}
              </time>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
