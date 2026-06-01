// Types partagés pour les actions horaires. Fichier SÉPARÉ de l'action :
// un fichier "use server" ne peut exporter que des fonctions async.

export type PrayerTimesActionState = {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string>
}

export type SuggestActionResult =
  | {
      ok: true
      suggested: {
        fajrAdhan: string
        dhuhrAdhan: string
        asrAdhan: string
        maghribAdhan: string
        ishaAdhan: string
      }
    }
  | { ok: false; message: string }
  