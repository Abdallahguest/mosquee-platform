import { getTranslations, getLocale } from "next-intl/server"
import { getSessionMosque } from "@/lib/auth-helpers"
import { getRecentAuditLog } from "@/db/queries"
import NoMosque from "@/components/admin/NoMosque"

// Catégories d'actions avec icône, couleur et libellé lisible.
const ACTION_MAP: Record<string, { icon: string; label: string; color: string }> = {
  // Annonces
  "announcement.create":    { icon: "📢", label: "Annonce créée",         color: "bg-blue-50 text-blue-700 border-blue-200" },
  "announcement.update":    { icon: "✏️",  label: "Annonce modifiée",      color: "bg-gray-50 text-gray-700 border-gray-200" },
  "announcement.delete":    { icon: "🗑",  label: "Annonce supprimée",     color: "bg-red-50 text-red-700 border-red-200" },
  "announcement.publish":   { icon: "✅",  label: "Annonce publiée",       color: "bg-green-50 text-green-700 border-green-200" },
  "announcement.unpublish": { icon: "⏸",  label: "Annonce dépubliée",     color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  "announcement.pin":       { icon: "📌",  label: "Annonce épinglée",      color: "bg-purple-50 text-purple-700 border-purple-200" },
  "announcement.unpin":     { icon: "📌",  label: "Annonce désépinglée",   color: "bg-gray-50 text-gray-700 border-gray-200" },
  // Événements
  "event.create":           { icon: "📅",  label: "Événement créé",        color: "bg-blue-50 text-blue-700 border-blue-200" },
  "event.update":           { icon: "✏️",  label: "Événement modifié",     color: "bg-gray-50 text-gray-700 border-gray-200" },
  "event.delete":           { icon: "🗑",  label: "Événement supprimé",    color: "bg-red-50 text-red-700 border-red-200" },
  // Membres
  "member.create":          { icon: "👤",  label: "Membre ajouté",         color: "bg-blue-50 text-blue-700 border-blue-200" },
  "member.update":          { icon: "✏️",  label: "Membre modifié",        color: "bg-gray-50 text-gray-700 border-gray-200" },
  "member.delete":          { icon: "🗑",  label: "Membre supprimé",       color: "bg-red-50 text-red-700 border-red-200" },
  // Paramètres
  "settings.update":        { icon: "⚙️",  label: "Paramètres modifiés",   color: "bg-gray-50 text-gray-700 border-gray-200" },
  "prayer_times.update":    { icon: "🕌",  label: "Horaires modifiés",     color: "bg-green-50 text-green-700 border-green-200" },
  // subscription
  "subscription.renew":       { icon: "💰", label: "Paiement enregistré",   color: "bg-green-50 text-green-700 border-green-200" },
  "subscription.suspend":     { icon: "⛔", label: "Abonnement suspendu",    color: "bg-red-50 text-red-700 border-red-200" },
  "subscription.reactivate":  { icon: "✅", label: "Abonnement réactivé",   color: "bg-green-50 text-green-700 border-green-200" },
  // Super-admin
  "admin.assign":           { icon: "🔗",  label: "Admin assigné",         color: "bg-blue-50 text-blue-700 border-blue-200" },
  "admin.remove":           { icon: "❌",  label: "Admin retiré",          color: "bg-red-50 text-red-700 border-red-200" },
  "mosque.create":          { icon: "🕌",  label: "Mosquée créée",         color: "bg-blue-50 text-blue-700 border-blue-200" },
  "mosque.update":          { icon: "✏️",  label: "Mosquée modifiée",      color: "bg-gray-50 text-gray-700 border-gray-200" },
  "mosque.delete":          { icon: "🗑",  label: "Mosquée supprimée",     color: "bg-red-50 text-red-700 border-red-200" },
  "user.create":            { icon: "👤",  label: "Compte créé",           color: "bg-blue-50 text-blue-700 border-blue-200" },
  "user.update":            { icon: "✏️",  label: "Compte modifié",        color: "bg-gray-50 text-gray-700 border-gray-200" },
  "user.delete":            { icon: "🗑",  label: "Compte supprimé",       color: "bg-red-50 text-red-700 border-red-200" },
  // Connexions
  "auth.sign_in_success":   { icon: "🔑",  label: "Connexion réussie",     color: "bg-green-50 text-green-700 border-green-200" },
  "auth.sign_in_failed":    { icon: "⚠️",  label: "Tentative échouée",     color: "bg-red-50 text-red-700 border-red-200" },
}

function getAction(action: string) {
  return ACTION_MAP[action] ?? { icon: "•", label: action, color: "bg-gray-50 text-gray-500 border-gray-200" }
}

function formatDate(date: Date | string, locale: string) {
  return new Date(date).toLocaleString(locale === "ar" ? "ar-GN" : locale === "en" ? "en-GB" : "fr-GN", {
    weekday: "short",
    day:     "numeric",
    month:   "short",
    hour:    "2-digit",
    minute:  "2-digit",
  })
}

export default async function ActivityPage() {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return <NoMosque />

  const t      = await getTranslations("admin.activityPage")
  const locale = await getLocale()
  const logs   = await getRecentAuditLog(mosqueId, 50)

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
          <p className="text-sm text-gray-400 mt-1">
            Les actions apparaîtront ici au fur et à mesure.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const { icon, label, color } = getAction(log.action)
            const date = formatDate(log.createdAt, locale)
            const who  = log.userName ?? log.userEmail ?? "Système"

            return (
              <div
                key={log.id}
                className={`border rounded-xl px-4 py-3 ${color}`}
              >
                {/* Ligne principale : icône + action + date */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span aria-hidden="true" className="text-base shrink-0">{icon}</span>
                    <span className="text-sm font-semibold">{label}</span>
                  </div>
                  <time
                    className="text-xs opacity-70 whitespace-nowrap shrink-0 mt-0.5"
                    dateTime={new Date(log.createdAt).toISOString()}
                  >
                    {date}
                  </time>
                </div>

                {/* Détails et auteur */}
                <div className="mt-1.5 ms-7 space-y-0.5">
                  {log.details && (
                    <p className="text-xs opacity-80 break-words">
                      {log.details}
                    </p>
                  )}
                  <p className="text-xs opacity-60">
                    Par <span className="font-medium">{who}</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">
        50 dernières actions · les plus récentes en premier
      </p>
    </main>
  )
}
