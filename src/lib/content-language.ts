import { routing } from "@/i18n/routing"

// ─────────────────────────────────────────────────────────────
// HYPOTHÈSE DOCUMENTÉE (Option A) :
// Le contenu (annonces, événements) est saisi dans la langue PAR DÉFAUT de
// la plateforme (français). On n'a pas encore de colonne `contentLang` en base.
//
// → Le jour où l'admin pourra choisir la langue de son contenu (Option C),
//   remplacer `assumedContentLocale` par la vraie valeur stockée par item.
//   Tant que ce n'est pas fait, ne PAS prétendre détecter la langue
//   automatiquement (risque de ghich sur un texte court).
// ─────────────────────────────────────────────────────────────
export const assumedContentLocale = routing.defaultLocale // "fr"

// Noms des langues, affichés DANS la langue de l'interface courante.
const LANGUAGE_NAMES: Record<string, Record<string, string>> = {
  fr: { fr: "français", en: "anglais", ar: "arabe" },
  en: { fr: "French", en: "English", ar: "Arabic" },
  ar: { fr: "الفرنسية", en: "الإنجليزية", ar: "العربية" },
}

// Nom de la langue du contenu, exprimé dans la langue d'affichage `uiLocale`.
export function contentLanguageName(uiLocale: string): string {
  return LANGUAGE_NAMES[uiLocale]?.[assumedContentLocale] ?? assumedContentLocale
}

// Faut-il afficher la mention ? Seulement si l'interface diffère de la
// langue (supposée) du contenu.
export function shouldShowContentLangNote(uiLocale: string): boolean {
  return uiLocale !== assumedContentLocale
}
