// Types partagés pour les actions sur les horaires de prière.
// Fichier SÉPARÉ de l'action : un fichier "use server" ne peut exporter
// que des fonctions async. Les types vivent donc ici, importables côté
// client comme serveur sans contrainte.

export type PrayerTimesActionState = {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string>
}

export type SuggestActionResult =
  | { ok: true; suggested: { fajrTime: string; dhuhrTime: string; asrTime: string; maghribTime: string; ishaTime: string } }
  | { ok: false; message: string }
