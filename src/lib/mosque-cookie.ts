// Constante partagée entre auth-helpers.ts et select-mosque.actions.ts.
// Fichier séparé pour éviter l'import circulaire.
export const SELECTED_MOSQUE_COOKIE = "amana-selected-mosque"
export const SELECTED_MOSQUE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 jours
