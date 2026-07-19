// ─────────────────────────────────────────────────────────────
// audit.ts — Journal d'activité léger
//
// Enregistre les actions significatives des admins sans bloquer
// l'action principale. Les échecs de log sont silencieux (on ne
// fait jamais échouer une mutation à cause d'un log raté).
//
// Usage :
//   await logAction({ userId, mosqueId, action: "announcement.create",
//                     targetId: `announcement:${id}`, details: title })
// ─────────────────────────────────────────────────────────────

import { db } from "@/db/index"
import { auditLog } from "@/db/schema"

export interface LogActionParams {
  userId:    string | null | undefined
  mosqueId?: number | null
  action:    string
  targetId?: string | null
  details?:  string | null
}

export async function logAction(params: LogActionParams): Promise<void> {
  try {
    await db.insert(auditLog).values({
      userId:   params.userId   ?? null,
      mosqueId: params.mosqueId ?? null,
      action:   params.action,
      targetId: params.targetId ?? null,
      details:  params.details  ?? null,
    })
  } catch {
    // Silencieux : un log raté ne doit jamais bloquer l'action principale.
    // Sentry capturera l'erreur si elle est récurrente.
  }
}

// ── Constantes d'actions (exhaustives, stables, lisibles) ──
export const AUDIT_ACTIONS = {
  // Annonces
  ANNOUNCEMENT_CREATE:    "announcement.create",
  ANNOUNCEMENT_UPDATE:    "announcement.update",
  ANNOUNCEMENT_DELETE:    "announcement.delete",
  ANNOUNCEMENT_PUBLISH:   "announcement.publish",
  ANNOUNCEMENT_UNPUBLISH: "announcement.unpublish",
  ANNOUNCEMENT_PIN:       "announcement.pin",
  ANNOUNCEMENT_UNPIN:     "announcement.unpin",
  // Événements
  EVENT_CREATE:    "event.create",
  EVENT_UPDATE:    "event.update",
  EVENT_DELETE:    "event.delete",
  // Membres
  MEMBER_CREATE:   "member.create",
  MEMBER_UPDATE:   "member.update",
  MEMBER_DELETE:   "member.delete",
  // Paramètres mosquée
  SETTINGS_UPDATE:      "settings.update",
  PRAYER_TIMES_UPDATE:  "prayer_times.update",
  // Super-admin
  MOSQUE_CREATE:   "mosque.create",
  MOSQUE_UPDATE:   "mosque.update",
  MOSQUE_DELETE:   "mosque.delete",
  USER_CREATE:     "user.create",
  USER_UPDATE:     "user.update",
  USER_DELETE:     "user.delete",
  ADMIN_ASSIGN:    "admin.assign",
  ADMIN_REMOVE:    "admin.remove",
  // MFA
  MFA_SETUP_INITIATED:     "mfa.setup_initiated",
  MFA_ENABLED:             "mfa.enabled",
  MFA_DISABLED:            "mfa.disabled",
  MFA_VERIFICATION_FAILED: "mfa.verification_failed",
  EMERGENCY_EMAIL_UPDATED:  "emergency_email.updated",
  // Self-service registration
  SELF_SERVICE_REGISTER:   "self_service.register",
  SELF_SERVICE_MOSQUE_CREATE: "self_service.mosque_create",
  // Emergency recovery
  EMERGENCY_RECOVERY_INITIATED: "emergency_recovery.initiated",
  EMERGENCY_RECOVERY_COMPLETED: "emergency_recovery.completed",
} as const
