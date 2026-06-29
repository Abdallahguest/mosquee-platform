import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getAllMosques } from "@/db/queries"
import LanguageSwitcher from "@/components/public/LanguageSwitcher"
import HomeFooter from "@/components/public/HomeFooter"
import MosqueSearch from "@/components/public/MosqueSearch"

// Nombre maximum de mosquées affichées avant le message "et X autres"
const MAX_DISPLAY = 20

export default async function HomePage() {
  const t = await getTranslations("home")
  const allMosques = await getAllMosques()

  const displayed = allMosques.slice(0, MAX_DISPLAY)
  const remaining = allMosques.length - displayed.length

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="max-w-lg mx-auto px-6 py-12">

          {/* Language switcher */}
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          {/* Hero */}
          <div className="text-center mb-10">
            <div className="text-5xl mb-4" aria-hidden="true">🕌</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{t("title")}</h1>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
              {t("pitch")}
            </p>
          </div>

          {/* Liste des mosquées avec recherche */}
          <section aria-label={t("mosquesTitle")} className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              {t("mosquesTitle")}
            </h2>

            <MosqueSearch
              mosques={displayed}
              searchPlaceholder={t("searchPlaceholder")}
              noResultsLabel={t("noResults")}
            />

            {remaining > 0 && (
              <p className="text-xs text-gray-400 text-center mt-3">
                {t("andMore", { count: remaining })}
              </p>
            )}
          </section>

          {/* CTA — mosquée non listée */}
          <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-5 text-center space-y-3">
            <p className="font-semibold text-green-900 text-sm">{t("ctaTitle")}</p>
            <p className="text-green-700 text-xs">{t("ctaBody")}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a
                href="mailto:abdallahmarly90@gmail.com"
                className="inline-flex items-center justify-center gap-2 bg-white border border-green-300 text-green-800 text-sm font-medium px-4 py-2 rounded-xl hover:bg-green-100 transition-colors"
              >
                <span aria-hidden="true">✉</span> {t("ctaEmail")}
              </a>
              <a
                href="https://wa.me/224626736219"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-green-800 transition-colors"
              >
                <span aria-hidden="true">💬</span> {t("ctaWhatsApp")}
              </a>
            </div>
          </div>

        </div>
      </main>
      <HomeFooter />
    </div>
  )
}
