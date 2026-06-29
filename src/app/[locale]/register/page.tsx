import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"

// La page d'inscription est désactivée.
// Modèle B : les comptes sont créés directement par le super-admin (vérifiés d'emblée).
// Une inscription libre créerait des comptes non vérifiables (Resend en mode test)
// et des comptes orphelins non rattachés à une mosquée.
export default async function RegisterPage() {
  const t = await getTranslations("auth")

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4" aria-hidden="true">🕌</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("registerDisabledTitle")}</h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center space-y-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {t("registerDisabledBody")}
          </p>

          <Link
            href="/login"
            className="inline-block mt-2 bg-green-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-green-800 transition-colors"
          >
            {t("signInLink")}
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </main>
  )
}
