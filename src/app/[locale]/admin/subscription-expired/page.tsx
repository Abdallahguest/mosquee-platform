import { headers } from "next/headers"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getPrimaryMosqueByUserId } from "@/db/queries"
import { computeSubscriptionStatus } from "@/lib/subscription-status"
import { Link } from "@/i18n/navigation"
import LogoutButton from "@/components/LogoutButton"
import { redirect } from "next/navigation"

// Page affichée quand l'abonnement d'une mosquée est expiré ou suspendu.
// Anti-jahàla : message clair, honnête, sans jargon.
// Les données de la mosquée sont conservées — rien n'est perdu.

export default async function SubscriptionExpiredPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const mosque = await getPrimaryMosqueByUserId(session.user.id)
  if (!mosque) redirect("/admin")

  const status = computeSubscriptionStatus(mosque)
  // Si l'abonnement est en fait valide, retourner au dashboard
  if (status === "trial" || status === "active" || status === "expiring_soon") {
    redirect("/admin")
  }

  const isSuspended = status === "suspended"

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="text-6xl mb-6" aria-hidden="true">
          {isSuspended ? "⛔" : "⏰"}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {isSuspended
            ? "Accès suspendu"
            : "Période gratuite terminée"}
        </h1>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 text-start space-y-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {isSuspended
              ? "L'accès à votre espace d'administration a été suspendu par l'administrateur de la plateforme."
              : `La période gratuite de 3 mois de la mosquée ${mosque.name} est terminée.`}
          </p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-800 mb-1">
              🔒 Vos données sont en sécurité
            </p>
            <p className="text-xs text-green-700">
              Toutes vos annonces, horaires, événements et membres sont conservés.
              Rien n'a été supprimé. Votre page publique reste visible pour les fidèles.
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">
              Pour réactiver votre accès, contactez directement :
            </p>
            <div className="space-y-2">
              <a
                href="https://wa.me/224626736219"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors w-full justify-center"
              >
                💬 WhatsApp — +224 626 736 219
              </a>
              <a
                href="tel:+224626736219"
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors w-full justify-center"
              >
                📞 Appeler — +224 626 736 219
              </a>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Tarif : 40 000 GNF / mois · Paiement par espèces ou Orange Money
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href={`/m/${mosque.slug}`}
            className="text-sm text-green-700 hover:underline"
          >
            Voir la page publique de votre mosquée →
          </Link>
          <div className="flex justify-center">
            <LogoutButton />
          </div>
        </div>
      </div>
    </main>
  )
}
