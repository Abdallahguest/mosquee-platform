import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hors connexion",
}

// Page de repli affichée quand une page jamais consultée est demandée sans réseau.
// Volontairement autonome (hors [locale]) et sans next-intl : hors-ligne, on ne
// peut pas garantir la résolution de la locale. On reste donc sobre et trilingue.
// Aucune donnée de prière n'est affichée ici : ne JAMAIS montrer d'horaire dont
// on ne peut pas garantir la fraîcheur (anti-gharar, anti-ghich).
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="text-5xl mb-6" aria-hidden="true">🕌</div>

      <h1 className="text-xl font-bold text-gray-900 mb-2">
        Vous êtes hors connexion
      </h1>
      <p className="text-sm text-gray-600 mb-4 max-w-sm">
        Cette page n&apos;a pas encore été chargée. Reconnectez-vous pour la
        consulter. Les pages déjà visitées restent accessibles hors connexion.
      </p>

      <div className="text-xs text-gray-400 space-y-1" dir="ltr">
        <p lang="en">You are offline. Reconnect to view this page.</p>
        <p lang="ar" dir="rtl">أنت غير متصل بالإنترنت. أعد الاتصال لعرض هذه الصفحة.</p>
      </div>
    </div>
  )
}
