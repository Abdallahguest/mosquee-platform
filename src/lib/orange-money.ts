// ─────────────────────────────────────────────────────────────
// orange-money.ts — Validation et formatage des numéros Orange Money
//
// Un numéro Orange Money guinéen : 9 chiffres commençant par 6.
// Ex : 620000000, 661234567, 655 12 34 56 (espaces tolérés à la saisie).
//
// Anti-gharar : un numéro mal formaté pourrait faire envoyer de l'argent
// au mauvais destinataire — la validation est donc stricte.
// ─────────────────────────────────────────────────────────────

// Normalise : supprime tous les espaces, tirets et parenthèses.
function normalize(raw: string): string {
  return raw.replace(/[\s\-().+]/g, "")
}

// Un numéro valide commence par 6 et contient 9 chiffres au total.
const GUINEA_ORANGE_RE = /^6\d{8}$/

/**
 * Valide un numéro Orange Money guinéen.
 * Accepte les espaces (normalisés avant validation).
 * Accepte une chaîne vide ou undefined (champ optionnel non rempli).
 */
export function isValidOrangeMoneyNumber(raw: string | null | undefined): boolean {
  if (!raw) return true // champ optionnel : vide = ok
  return GUINEA_ORANGE_RE.test(normalize(raw))
}

/**
 * Formate un numéro pour l'affichage : XX XX XX XX X
 * Ex : "620000000" → "62 00 00 000"  (lisibilité humaine)
 * Si le format n'est pas reconnu, retourne la valeur brute.
 */
export function formatOrangeMoneyNumber(raw: string): string {
  const digits = normalize(raw)
  if (!GUINEA_ORANGE_RE.test(digits)) return raw
  // Groupe : 2 + 2 + 2 + 3
  return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`
}
