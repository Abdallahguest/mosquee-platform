import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"

export async function generateMetadata() {
  const t = await getTranslations("privacy")
  return { title: t("title") }
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy")
  const tc = await getTranslations("common")

  const sections = [
    { title: t("dataTitle"),       body: t("dataBody") },
    { title: t("trackingTitle"),   body: t("trackingBody") },
    { title: t("retentionTitle"),  body: t("retentionBody") },
    { title: t("thirdPartyTitle"), body: t("thirdPartyBody") },
    { title: t("contactTitle"),    body: t("contactBody") },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("title")}</h1>
        <p className="text-xs text-gray-400 mb-6">{t("lastUpdated")}</p>

        <p className="text-gray-600 mb-8">{t("intro")}</p>

        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-semibold text-gray-900 mb-1">{section.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <footer className="border-t border-gray-200 mt-10 pt-6">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← {tc("backToHome")}
          </Link>
        </footer>
      </div>
    </main>
  )
}
