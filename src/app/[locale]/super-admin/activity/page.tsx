import { requireSuperAdmin } from "@/lib/auth-helpers"
import { getGlobalAuditLog } from "@/db/queries"

// Mapping identique à celui du journal admin — libellés lisibles
const ACTION_MAP: Record<string, { icon: string; label: string; color: string }> = {
  "announcement.create":    { icon: "📢", label: "Annonce créée",          color: "bg-blue-50 text-blue-700 border-blue-200" },
  "announcement.update":    { icon: "✏️",  label: "Annonce modifiée",       color: "bg-gray-50 text-gray-700 border-gray-200" },
  "announcement.delete":    { icon: "🗑",  label: "Annonce supprimée",      color: "bg-red-50 text-red-700 border-red-200" },
  "announcement.publish":   { icon: "✅",  label: "Annonce publiée",        color: "bg-green-50 text-green-700 border-green-200" },
  "announcement.unpublish": { icon: "⏸",  label: "Annonce dépubliée",      color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  "announcement.pin":       { icon: "📌",  label: "Annonce épinglée",       color: "bg-purple-50 text-purple-700 border-purple-200" },
  "announcement.unpin":     { icon: "📌",  label: "Annonce désépinglée",    color: "bg-gray-50 text-gray-700 border-gray-200" },
  "event.create":           { icon: "📅",  label: "Événement créé",         color: "bg-blue-50 text-blue-700 border-blue-200" },
  "event.update":           { icon: "✏️",  label: "Événement modifié",      color: "bg-gray-50 text-gray-700 border-gray-200" },
  "event.delete":           { icon: "🗑",  label: "Événement supprimé",     color: "bg-red-50 text-red-700 border-red-200" },
  "member.create":          { icon: "👤",  label: "Membre ajouté",          color: "bg-blue-50 text-blue-700 border-blue-200" },
  "member.update":          { icon: "✏️",  label: "Membre modifié",         color: "bg-gray-50 text-gray-700 border-gray-200" },
  "member.delete":          { icon: "🗑",  label: "Membre supprimé",        color: "bg-red-50 text-red-700 border-red-200" },
  "settings.update":        { icon: "⚙️",  label: "Paramètres modifiés",    color: "bg-gray-50 text-gray-700 border-gray-200" },
  "prayer_times.update":    { icon: "🕌",  label: "Horaires modifiés",      color: "bg-green-50 text-green-700 border-green-200" },
  "admin.assign":           { icon: "🔗",  label: "Admin assigné",          color: "bg-blue-50 text-blue-700 border-blue-200" },
  "admin.remove":           { icon: "❌",  label: "Admin retiré",           color: "bg-red-50 text-red-700 border-red-200" },
  "mosque.create":          { icon: "🕌",  label: "Mosquée créée",          color: "bg-blue-50 text-blue-700 border-blue-200" },
  "mosque.update":          { icon: "✏️",  label: "Mosquée modifiée",       color: "bg-gray-50 text-gray-700 border-gray-200" },
  "mosque.delete":          { icon: "🗑",  label: "Mosquée supprimée",      color: "bg-red-50 text-red-700 border-red-200" },
  "user.create":            { icon: "👤",  label: "Compte créé",            color: "bg-blue-50 text-blue-700 border-blue-200" },
  "user.update":            { icon: "✏️",  label: "Compte modifié",         color: "bg-gray-50 text-gray-700 border-gray-200" },
  "user.delete":            { icon: "🗑",  label: "Compte supprimé",        color: "bg-red-50 text-red-700 border-red-200" },
  "subscription.renew":     { icon: "💰",  label: "Paiement enregistré",    color: "bg-green-50 text-green-700 border-green-200" },
  "subscription.suspend":   { icon: "⛔",  label: "Abonnement suspendu",    color: "bg-red-50 text-red-700 border-red-200" },
  "subscription.reactivate":{ icon: "✅",  label: "Abonnement réactivé",    color: "bg-green-50 text-green-700 border-green-200" },
  "auth.sign_in_success":   { icon: "🔑",  label: "Connexion réussie",      color: "bg-green-50 text-green-700 border-green-200" },
  "auth.sign_in_failed":    { icon: "⚠️",  label: "Tentative échouée",      color: "bg-red-50 text-red-700 border-red-200" },
}

function getAction(action: string) {
  return ACTION_MAP[action] ?? { icon: "•", label: action, color: "bg-gray-50 text-gray-500 border-gray-200" }
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString("fr-FR", {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  })
}

export default async function GlobalActivityPage() {
  await requireSuperAdmin()
  const logs = await getGlobalAuditLog(100)

  // Comptage par mosquée pour le résumé
  const byMosque = logs.reduce<Record<string, number>>((acc, log) => {
    const key = log.mosqueName ?? "Système"
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Activité globale</h1>
        <p className="text-gray-500 text-sm">
          Les 100 dernières actions sur toute la plateforme — toutes mosquées confondues.
        </p>
      </div>

      {/* Résumé par mosquée */}
      {Object.keys(byMosque).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(byMosque)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => (
              <span key={name} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                {name} · {count} action{count > 1 ? "s" : ""}
              </span>
            ))}
        </div>
      )}

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4" aria-hidden="true">📋</div>
          <p className="text-base font-medium text-gray-700">Aucune action enregistrée.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const { icon, label, color } = getAction(log.action)
            const who    = log.userName ?? log.userEmail ?? "Système"
            const mosque = log.mosqueName ?? "—"

            return (
              <div
                key={log.id}
                className={`border rounded-xl px-4 py-3 ${color}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span aria-hidden="true" className="text-base shrink-0">{icon}</span>
                    <span className="text-sm font-semibold">{label}</span>
                  </div>
                  <time
                    className="text-xs opacity-70 whitespace-nowrap shrink-0 mt-0.5"
                    dateTime={new Date(log.createdAt).toISOString()}
                  >
                    {formatDate(log.createdAt)}
                  </time>
                </div>
                <div className="mt-1.5 ms-7 space-y-0.5">
                  {log.details && (
                    <p className="text-xs opacity-80 break-words">{log.details}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs opacity-60">
                    <span>Par <strong>{who}</strong></span>
                    <span>· <strong>{mosque}</strong></span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">
        100 dernières actions · toutes mosquées · les plus récentes en premier
      </p>
    </div>
  )
}
