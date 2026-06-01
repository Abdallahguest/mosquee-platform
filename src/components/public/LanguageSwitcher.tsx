"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

const LABELS: Record<string, string> = {
  fr: "FR",
  en: "EN",
  ar: "ع",
}

// Noms complets pour les lecteurs d'écran (corrige A4)
const NAMES: Record<string, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
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
    <div className={`inline-flex rounded-lg p-0.5 ${containerClass}`} role="group" aria-label="Langue">
      {routing.locales.map((loc) => {
        const isActive = locale === loc
        return (
          <button
            key={loc}
            onClick={() => switchTo(loc)}
            lang={loc}
            aria-label={NAMES[loc]}
            aria-current={isActive ? "true" : undefined}
            className={`px-3 py-1 text-sm rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 ${
              isActive ? activeClass : inactiveClass
            }`}
          >
            {LABELS[loc]}
          </button>
        )
      })}
    </div>
  )
}
