import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { SelfServiceRegisterForm } from "./SelfServiceRegisterForm"

// Modèle C hybride : inscription self-service activée
// Les utilisateurs peuvent s'inscrire et créer leur mosquée en mode trial.
// L'email doit être vérifié avant d'accéder au panel admin.
export default async function RegisterPage() {
  const t = await getTranslations("auth")

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4" aria-hidden="true">🕌</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("registerTitle")}</h1>
          <p className="text-gray-600 text-sm">{t("registerSubtitle")}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <SelfServiceRegisterForm />
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            {t("alreadyHaveAccount")}
          </Link>
        </div>
      </div>
    </main>
  )
}
