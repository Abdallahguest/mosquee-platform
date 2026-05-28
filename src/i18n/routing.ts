import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["fr", "en", "ar"],
  defaultLocale: "fr",
  localePrefix: "as-needed", // pas de /fr pour la langue par défaut
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]
