import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getAllMosques } from "@/db/queries"
import LanguageSwitcher from "@/components/public/LanguageSwitcher"

export default async function HomePage() {
  const t = await getTranslations("home")
  const tc = await getTranslations("common")
  const mosques = await getAllMosques()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-6 py-16">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🕌</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("title")}</h1>
          <p className="text-gray-500">{t("subtitle")}</p>
        </div>

        <div className="flex flex-col gap-3">
          {mosques.map((mosque) => (
            <Link
              key={mosque.slug}
              href={`/m/${mosque.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm hover:border-green-300 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                  {mosque.name}
                </p>
                <p className="text-sm text-gray-500">{mosque.city}, {mosque.country}</p>
              </div>
              <span className="text-gray-400 rtl:rotate-180 group-hover:text-green-700 transition-colors">→</span>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="/admin" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            {t("adminAccess")} →
          </a>
        </div>
      </div>
    </main>
  )
}
