// Valide et normalise un numéro Orange Money guinéen.
//
// Format attendu : 9 chiffres, commence par 6 (ex: 622123456).
// Les espaces sont tolérés en saisie ("622 12 34 56") mais retirés avant
// validation et stockage — la BDD ne garde que des chiffres.
//
// IMPORTANT : ceci ne vérifie qu'un FORMAT, pas l'existence réelle du
// numéro ni qu'il est bien rattaché à un compte Orange Money actif.
// La plateforme ne fait aucune vérification auprès d'Orange — c'est à
// l'admin de la mosquée de saisir le bon numéro (anti-gharar : le don
// passe en transfert direct, hors de tout contrôle de la plateforme).

const ORANGE_MONEY_REGEX = /^6\d{8}$/

export function normalizeOrangeMoneyNumber(raw: string): string {
  return raw.replace(/\s/g, "")
}

export function isValidOrangeMoneyNumber(raw: string): boolean {
  if (!raw) return true // champ optionnel : vide est valide
  return ORANGE_MONEY_REGEX.test(normalizeOrangeMoneyNumber(raw))
}

// Formate un numéro normalisé (9 chiffres) en groupes lisibles : "622 12 34 56".
// Si le format est inattendu (longueur différente), retourne tel quel plutôt
// que de produire un affichage tronqué ou trompeur.
export function formatOrangeMoneyNumber(normalized: string): string {
  if (!/^\d{9}$/.test(normalized)) return normalized
  return normalized.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4")
}
