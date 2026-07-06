import { requireSuperAdmin } from "@/lib/auth-helpers"
import { getGlobalAuditLog } from "@/db/queries"

const ACTION_MAP: Record<string, { icon: string; label: string; color: string }> = {
  "announcement.create":     { icon: "📢", label: "Annonce créée",         color: "bg-blue-50 text-blue-700 border-blue-200" },
  "announcement.update":     { icon: "✏️",  label: "Annonce modifiée",      color: "bg-gray-50 text-gray-700 border-gray-200" },
  "announcement.delete":     { icon: "🗑",  label: "Annonce supprimée",     color: "bg-red-50 text-red-700 border-red-200" },
  "announcement.publish":    { icon: "✅",  label: "Annonce publiée",       color: "bg-green-50 text-green-700 border-green-200" },
  "announcement.unpublish":  { icon: "⏸",  label: "Annonce dépubliée",     color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  "announcement.pin":        { icon: "📌",  label: "Annonce épinglée",      color: "bg-purple-50 text-purple-700 border-purple-200" },
  "announcement.unpin":      { icon: "📌",  label: "Annonce désépinglée",   color: "bg-gray-50 text-gray-700 border-gray-200" },
  "event.create":            { icon: "📅",  label: "Événement créé",        color: "bg-blue-50 text-blue-700 border-blue-200" },
  "event.update":            { icon: "✏️",  label: "Événement modifié",     color: "bg-gray-50 text-gray-700 border-gray-200" },
  "event.delete":            { icon: "🗑",  label: "Événement supprimé",    color: "bg-red-50 text-red-700 border-red-200" },
  "member.create":           { icon: "👤",  label: "Membre ajouté",         color: "bg-blue-50 text-blue-700 border-blue-200" },
  "member.update":           { icon: "✏️",  label: "Membre modifié",        color: "bg-gray-50 text-gray-700 border-gray-200" },
  "member.delete":           { icon: "🗑",  label: "Membre supprimé",       color: "bg-red-50 text-red-700 border-red-200" },
  "settings.update":         { icon: "⚙️",  label: "Paramètres modifiés",   color: "bg-gray-50 text-gray-700 border-gray-200" },
  "prayer_times.update":     { icon: "🕌",  label: "Horaires modifiés",     color: "bg-green-50 text-green-700 border-green-200" },
  "admin.assign":            { icon: "🔗",  label: "Admin assigné",         color: "bg-blue-50 text-blue-700 border-blue-200" },
  "admin.remove":            { icon: "❌",  label: "Admin retiré",          color: "bg-red-50 text-red-700 border-red-200" },
  "mosque.create":           { icon: "🕌",  label: "Mosquée créée",         color: "bg-blue-50 text-blue-700 border-blue-200" },
  "mosque.update":           { icon: "✏️",  label: "Mosquée modifiée",      color: "bg-gray-50 text-gray-700 border-gray-200" },
  "mosque.delete":           { icon: "🗑",  label: "Mosquée supprimée",     color: "bg-red-50 text-red-700 border-red-200" },
  "user.create":             { icon: "👤",  label: "Compte créé",           color: "bg-blue-50 text-blue-700 border-blue-200" },
  "user.update":             { icon: "✏️",  label: "Compte modifié",        color: "bg-gray-50 text-gray-700 border-gray-200" },
  "user.delete":             { icon: "🗑",  label: "Compte supprimé",       color: "bg-red-50 text-red-700 border-red-200" },
  "subscription.renew":      { icon: "💰",  label: "Paiement enregistré",   color: "bg-green-50 text-green-700 border-green-200" },
  "subscription.suspend":    { icon: "⛔",  label: "Abonnement suspendu",   color: "bg-red-50 text-red-700 border-red-200" },
  "subscription.reactivate": { icon: "✅",  label: "Abonnement réactivé",   color: "bg-green-50 text-green-700 border-green-200" },
  "auth.sign_in_success":    { icon: "🔑",  label: "Connexion réussie",     color: "bg-green-50 text-green-700 border-green-200" },
  "auth.sign_in_failed":     { icon: "⚠️",  label: "Tentative échouée",     color: "bg-red-50 text-red-700 border-red-200" },
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

  // Regrouper par mosquée
  const grouped = logs.reduce<Record<string, typeof logs>>((acc, log) => {
    const key = log.mosqueName ?? "Système / Actions globales"
    if (!acc[key]) acc[key] = []
    acc[key].push(log)
    return acc
  }, {})

  // Trier les mosquées par date de dernière action (la plus récente en premier)
  const sortedGroups = Object.entries(grouped).sort(
    (a, b) => new Date(b[1][0].createdAt).getTime() - new Date(a[1][0].createdAt).getTime()
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Activité globale</h1>
        <p className="text-gray-500 text-sm">
          {logs.length} actions · {sortedGroups.length} mosquée{sortedGroups.length > 1 ? "s" : ""} · les plus récentes en premier
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4" aria-hidden="true">📋</div>
          <p className="text-base font-medium text-gray-700">Aucune action enregistrée.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedGroups.map(([mosqueName, entries]) => (
            <div key={mosqueName}>
              {/* En-tête du groupe mosquée */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg" aria-hidden="true">🕌</span>
                <h2 className="font-bold text-gray-900">{mosqueName}</h2>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                  {entries.length} action{entries.length > 1 ? "s" : ""}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  Dernière : {formatDate(entries[0].createdAt)}
                </span>
              </div>

              {/* Liste des actions de cette mosquée */}
              <div className="space-y-1.5 ps-6 border-s-2 border-gray-100">
                {entries.map((log) => {
                  const { icon, label, color } = getAction(log.action)
                  const who = log.userName ?? log.userEmail ?? "Système"

                  return (
                    <div
                      key={log.id}
                      className={`border rounded-xl px-4 py-2.5 ${color}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span aria-hidden="true" className="text-sm shrink-0">{icon}</span>
                          <span className="text-sm font-semibold">{label}</span>
                        </div>
                        <time
                          className="text-xs opacity-60 whitespace-nowrap shrink-0"
                          dateTime={new Date(log.createdAt).toISOString()}
                        >
                          {formatDate(log.createdAt)}
                        </time>
                      </div>
                      <div className="mt-1 ms-6 flex flex-wrap gap-3 text-xs opacity-60">
                        {log.details && <span className="break-words">{log.details}</span>}
                        <span>Par <strong>{who}</strong></span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
