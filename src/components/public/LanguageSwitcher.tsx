"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

const LABELS: Record<string, string> = {
  fr: "FR",
  en: "EN",
  ar: "ع",
}

interface LanguageSwitcherProps {
  variant?: "onLight" | "onGreen"
}

export default function LanguageSwitcher({ variant = "onLight" }: LanguageSwitcherProps) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  function switchTo(newLocale: string) {
    router.replace(pathname, { locale: newLocale })
  }

  const containerClass =
    variant === "onGreen"
      ? "bg-green-950/40"
      : "border border-gray-200 bg-white"

  const activeClass =
    variant === "onGreen"
      ? "bg-white text-green-800 font-medium"
      : "bg-green-700 text-white"

  const inactiveClass =
    variant === "onGreen"
      ? "text-green-100 hover:text-white"
      : "text-gray-600 hover:text-gray-900"

  return (
    <div className={`inline-flex rounded-lg p-0.5 ${containerClass}`}>
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchTo(loc)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            locale === loc ? activeClass : inactiveClass
          }`}
        >
          {LABELS[loc]}
        </button>
      ))}
    </div>
  )
}
