export interface PrayerTimesActionState { ok: boolean; message: string; fieldErrors?: Record<string, string> }
export interface SuggestedAdhan {
  fajrAdhan: string; dhuhrAdhan: string; asrAdhan: string; maghribAdhan: string; ishaAdhan: string
}
export type SuggestActionResult =
  | { ok: true; suggested: SuggestedAdhan }
  | { ok: false; message: string }
