// Contrat partagé des résultats d'action.
// Les erreurs sont des CODES STABLES (pas des phrases) ; la traduction se fait
// côté composant via useErrorMessages(). `codes` porte le détail quand plusieurs
// validations échouent à la fois.
export type ActionResult<T = void> =
  | { success: true;  data: T;       error?: never;   codes?: never }
  | { success: false; error: string; codes?: string[]; data?: never }

// Codes d'erreur connus. Tout code absent de ce set retombe sur UNKNOWN_ERROR
// à l'affichage (anti-jahàla : jamais de clé brute ni de phrase technique).
export const ERROR_CODES = {
  // Autorisation / contexte
  NO_MOSQUE:               "NO_MOSQUE",
  UNAUTHORIZED:            "UNAUTHORIZED",
  MOSQUE_NOT_FOUND:        "MOSQUE_NOT_FOUND",
  ANNOUNCEMENT_NOT_FOUND:  "ANNOUNCEMENT_NOT_FOUND",
  EVENT_NOT_FOUND:         "EVENT_NOT_FOUND",
  // Opérations
  CREATE_FAILED:  "CREATE_FAILED",
  UPDATE_FAILED:  "UPDATE_FAILED",
  DELETE_FAILED:  "DELETE_FAILED",
  SAVE_FAILED:    "SAVE_FAILED",
  EXPORT_FAILED:  "EXPORT_FAILED",
  // Validation
  INVALID_DATA:          "INVALID_DATA",
  TITLE_REQUIRED:        "TITLE_REQUIRED",
  TITLE_TOO_LONG:        "TITLE_TOO_LONG",
  CONTENT_REQUIRED:      "CONTENT_REQUIRED",
  CONTENT_TOO_LONG:      "CONTENT_TOO_LONG",
  DESCRIPTION_TOO_LONG:  "DESCRIPTION_TOO_LONG",
  LOCATION_REQUIRED:     "LOCATION_REQUIRED",
  LOCATION_TOO_LONG:     "LOCATION_TOO_LONG",
  START_REQUIRED:        "START_REQUIRED",
  END_BEFORE_START:      "END_BEFORE_START",
  TIME_FORMAT_INVALID:   "TIME_FORMAT_INVALID",
  NAME_REQUIRED:         "NAME_REQUIRED",
  NAME_TOO_LONG:         "NAME_TOO_LONG",
  CITY_REQUIRED:         "CITY_REQUIRED",
  CITY_TOO_LONG:         "CITY_TOO_LONG",
  COUNTRY_REQUIRED:      "COUNTRY_REQUIRED",
  COUNTRY_TOO_LONG:      "COUNTRY_TOO_LONG",
  LATITUDE_INVALID:      "LATITUDE_INVALID",
  LONGITUDE_INVALID:     "LONGITUDE_INVALID",
  TIMEZONE_REQUIRED:     "TIMEZONE_REQUIRED",
  METHOD_INVALID:        "METHOD_INVALID",
  DONATION_URL_INVALID:  "DONATION_URL_INVALID",
  ORANGE_MONEY_INVALID:  "ORANGE_MONEY_INVALID",
  AUDIO_MISSING:         "AUDIO_MISSING",
  AUDIO_TOO_LARGE:       "AUDIO_TOO_LARGE",
  AUDIO_INVALID_TYPE:    "AUDIO_INVALID_TYPE",
  AUDIO_UPLOAD_FAILED:   "AUDIO_UPLOAD_FAILED",
  AUDIO_KEY_NOT_FOUND:   "AUDIO_KEY_NOT_FOUND",
  AUDIO_DELETE_FAILED:   "AUDIO_DELETE_FAILED",
  CONTACT_EMAIL_INVALID: "CONTACT_EMAIL_INVALID",
  PHONE_TOO_LONG:        "PHONE_TOO_LONG",
  // Repli ultime
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const

export type ErrorCode = keyof typeof ERROR_CODES
