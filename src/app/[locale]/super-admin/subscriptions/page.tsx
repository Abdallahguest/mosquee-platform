import { requireSuperAdmin } from "@/lib/auth-helpers"
import { getAllMosquesAdmin, getRecentPayments } from "@/db/queries"
import { computeSubscriptionStatus } from "@/lib/subscription-status"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import RenewButton from "@/components/superadmin/RenewButton"
import SuspendButton from "@/components/superadmin/SuspendButton"
import ReactivateButton from "@/components/superadmin/ReactivateButton"
function statusBadge(status: ReturnType<typeof computeSubscriptionStatus>) {
  const config = {
    trial:          { label: "Période gratuite", className: "bg-blue-100 text-blue-700 border-blue-200" },
    active:         { label: "Actif",             className: "bg-green-100 text-green-700 border-green-200" },
    expiring_soon:  { label: "Expire bientôt",    className: "bg-amber-100 text-amber-700 border-amber-200" },
    expired:        { label: "Expiré",             className: "bg-red-100 text-red-700 border-red-200" },
    suspended:      { label: "Suspendu",           className: "bg-gray-100 text-gray-700 border-gray-200" },
  }
  const { label, className } = config[status]
  return <Badge variant="outline" className={className}>{label}</Badge>
}

function formatDate(d: Date | null): string {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

// Génère le lien WhatsApp avec message pré-rédigé selon le statut
function generateWhatsAppLink(mosqueName: string, status: string): string {
  const phone = "224626736219"
  const message = status === "expired"
    ? `Assalamu alaykum. Je me permets de vous contacter au sujet de la mosquée ${mosqueName} sur Amana Connect. Votre période d'accès a expiré. Pour continuer à utiliser le service, le tarif est de 40 000 GNF/mois. Je reste disponible pour tout arrangement. Abdoulaye Bah.`
    : `Assalamu alaykum. Je vous contacte au sujet de la mosquée ${mosqueName} sur Amana Connect. Votre accès expire très bientôt. Pour renouveler, le tarif est de 40 000 GNF/mois (espèces ou Orange Money). N'hésitez pas à me contacter. Abdoulaye Bah.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export default async function SubscriptionsPage() {
  await requireSuperAdmin()
  const [mosques, recentPayments] = await Promise.all([
    getAllMosquesAdmin(),
    getRecentPayments(30),
  ])

  const enriched = mosques.map((m) => ({
    ...m,
    computedStatus: computeSubscriptionStatus(m),
  }))

  // Trier : expirés d'abord, puis expiring_soon, puis trial, puis active
  const order = { expired: 0, suspended: 1, expiring_soon: 2, trial: 3, active: 4 }
  enriched.sort((a, b) => order[a.computedStatus] - order[b.computedStatus])

  const stats = {
    active:        enriched.filter((m) => m.computedStatus === "active").length,
    trial:         enriched.filter((m) => m.computedStatus === "trial").length,
    expiring_soon: enriched.filter((m) => m.computedStatus === "expiring_soon").length,
    expired:       enriched.filter((m) => m.computedStatus === "expired").length,
    suspended:     enriched.filter((m) => m.computedStatus === "suspended").length,
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Gestion des abonnements</h1>
        <p className="text-gray-500 text-sm">Suivi des paiements et statuts de toutes les mosquées.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Actifs",         value: stats.active,        color: "text-green-700" },
          { label: "Essai",          value: stats.trial,         color: "text-blue-700" },
          { label: "Expire bientôt", value: stats.expiring_soon, color: "text-amber-700" },
          { label: "Expirés",        value: stats.expired,       color: "text-red-700" },
          { label: "Suspendus",      value: stats.suspended,     color: "text-gray-700" },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-4 text-center">
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
              <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Liste mosquées */}
      <div className="space-y-3 mb-10">
        {enriched.map((mosque) => (
          <Card key={mosque.id} className={
            mosque.computedStatus === "expired" ? "border-red-200" :
            mosque.computedStatus === "expiring_soon" ? "border-amber-200" :
            mosque.computedStatus === "suspended" ? "border-gray-300" : ""
          }>
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{mosque.name}</span>
                    {statusBadge(mosque.computedStatus)}
                    {mosque.isVerified && <Badge variant="secondary" className="text-xs">✓</Badge>}
                  </div>
                  <p className="text-xs text-gray-500">{mosque.city}, {mosque.country}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Essai jusqu&apos;au : <strong>{formatDate(mosque.trialEndsAt)}</strong></span>
                    <span>Payé jusqu&apos;au : <strong>{formatDate(mosque.paidUntil)}</strong></span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:items-end shrink-0">
                  <RenewButton mosqueId={mosque.id} mosqueName={mosque.name} />

                  {/* Bouton WhatsApp rappel — visible si expire bientôt ou expiré */}
                  {(mosque.computedStatus === "expiring_soon" || mosque.computedStatus === "expired") && (
                    <a
                      href={generateWhatsAppLink(mosque.name, mosque.computedStatus)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-800 border border-green-300 rounded-lg px-3 py-1.5 bg-green-50 hover:bg-green-100 transition-colors"
                    >
                      💬 Envoyer rappel WhatsApp
                    </a>
                  )}

                  {mosque.computedStatus !== "suspended" ? (
                    <SuspendButton mosqueId={mosque.id} mosqueName={mosque.name} />
                  ) : (
                    <ReactivateButton mosqueId={mosque.id} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Historique des paiements */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Historique des paiements
          <span className="ml-2 text-sm font-normal text-gray-400">({recentPayments.length} derniers)</span>
        </h2>

        {recentPayments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3" aria-hidden="true">💰</div>
            <p className="text-sm">Aucun paiement enregistré pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentPayments.map((p) => (
              <Card key={p.id}>
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">{p.mosqueName}</span>
                        <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                          {p.amountGNF.toLocaleString("fr-FR")} GNF
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {p.months} mois
                        </Badge>
                        <Badge variant="outline" className="text-xs text-gray-500">
                          {p.paymentMethod === "cash" ? "💵 Espèces" : "🟠 Orange Money"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                        <span>Du {formatDate(p.periodStart)} au {formatDate(p.periodEnd)}</span>
                        {p.note && <span className="italic">· {p.note}</span>}
                      </div>
                    </div>
                    <time className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                      {formatDate(p.createdAt)}
                    </time>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Total du mois en cours */}
        {recentPayments.length > 0 && (() => {
          const now = new Date()
          const thisMonth = recentPayments.filter((p) => {
            const d = new Date(p.createdAt)
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          })
          const total = thisMonth.reduce((sum, p) => sum + p.amountGNF, 0)
          return total > 0 ? (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <p className="text-sm text-green-800">
                <strong>Ce mois-ci :</strong> {total.toLocaleString("fr-FR")} GNF encaissés
                {" "}({thisMonth.length} paiement{thisMonth.length > 1 ? "s" : ""})
              </p>
            </div>
          ) : null
        })()}
      </div>
    </div>
  )
}
