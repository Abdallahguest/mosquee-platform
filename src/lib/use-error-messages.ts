"use client"

import { useTranslations } from "next-intl"

// Traduit un code d'erreur (ou une liste) en message lisible.
// Repli systématique sur UNKNOWN_ERROR si le code n'a pas de traduction,
// pour ne jamais afficher de clé brute ni de phrase technique (anti-jahàla).
export function useErrorMessages() {
  const t = useTranslations("admin.errors")

  function translate(code: string): string {
    // t.has évite d'afficher la clé brute si le code est inconnu.
    return t.has(code) ? t(code) : t("UNKNOWN_ERROR")
  }

  // Pour un résultat d'action complet : si plusieurs codes (validation
  // multiple), on les joint ; sinon on traduit le code principal.
  function fromResult(result: { error: string; codes?: string[] }): string {
    if (result.codes && result.codes.length > 0) {
      return result.codes.map(translate).join(" · ")
    }
    return translate(result.error)
  }

  return { translate, fromResult }
}
