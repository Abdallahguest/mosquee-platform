// Choisit le nom de la mosquée à afficher selon la langue active.
// Priorité : nom officiel dans la langue → nom par défaut (name).
// Aucune traduction automatique : on n'affiche un nom localisé que si
// l'admin l'a explicitement saisi. Sinon on retombe sur le nom par défaut.
//
// Utilisé PARTOUT où le nom s'affiche (nav, titre, footer, métadonnées)
// pour garantir la cohérence : jamais le nom traduit à un endroit et le
// nom par défaut à un autre.

interface MosqueNames {
  name: string
  nameFr?: string | null
  nameEn?: string | null
  nameAr?: string | null
}

export function getMosqueName(mosque: MosqueNames, locale: string): string {
  const byLocale: Record<string, string | null | undefined> = {
    fr: mosque.nameFr,
    en: mosque.nameEn,
    ar: mosque.nameAr,
  }
  const localized = byLocale[locale]
  // trim() pour ignorer un champ rempli d'espaces ; sinon nom par défaut.
  return localized && localized.trim() !== "" ? localized : mosque.name
}
