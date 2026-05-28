"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

const LABELS: Record<string, string> = {
  fr: "FR",
  en: "EN",
  ar: "ع",
}

export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  function switchTo(newLocale: string) {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchTo(loc)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            locale === loc
              ? "bg-green-700 text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {LABELS[loc]}
        </button>
      ))}
    </div>
  )
}
