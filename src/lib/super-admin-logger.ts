/**
 * Module de logging et d'alertes pour les accès super-admin
 * 
 * Enregistre tous les accès des super-admins et envoie des alertes
 * pour les actions sensibles.
 */

import { logAction, AUDIT_ACTIONS } from "./audit"
import { isSuperAdmin } from "./authorization"
import type { AuthUser } from "./authorization"

export interface SuperAdminAccessParams {
  user: AuthUser
  action: string
  details?: string
  mosqueId?: number
  ipAddress?: string
  userAgent?: string
}

/**
 * Logger les accès super-admin avec alertes automatiques
 */
export async function logSuperAdminAccess(params: SuperAdminAccessParams): Promise<void> {
  const { user, action, details, mosqueId, ipAddress, userAgent } = params

  if (!isSuperAdmin(user)) {
    return
  }

  // Logger dans l'audit log
  await logAction({
    userId: user.id,
    mosqueId,
    action,
    details: details ? `${details} | IP: ${ipAddress || "unknown"} | UA: ${userAgent || "unknown"}` : undefined,
  })

  // Actions sensibles qui déclenchent une alerte immédiate
  const sensitiveActions = [
    AUDIT_ACTIONS.USER_DELETE,
    AUDIT_ACTIONS.MOSQUE_DELETE,
    AUDIT_ACTIONS.MFA_DISABLED,
    AUDIT_ACTIONS.EMERGENCY_RECOVERY_COMPLETED,
  ]

  if (sensitiveActions.includes(action as any)) {
    await sendCriticalAlert({
      user,
      action,
      details,
      ipAddress,
      userAgent,
    })
  }
}

/**
 * Envoie une alerte critique pour les actions super-admin sensibles
 */
async function sendCriticalAlert(params: {
  user: AuthUser
  action: string
  details?: string
  ipAddress?: string
  userAgent?: string
  mosqueId?: number
}): Promise<void> {
  const { user, action, details, ipAddress, userAgent, mosqueId } = params

  try {
    // Log dans l'audit log avec un niveau critique
    await logAction({
      userId: user.id,
      action: "super_admin.critical_alert",
      details: `CRITICAL: ${action} by ${user.id} | ${details || ""} | IP: ${ipAddress || "unknown"}`,
    })

    // Envoyer les alertes via les canaux configurés (Slack, SMS, Email)
    const { sendCriticalAlert: sendAlerts } = await import("./alerts")
    
    // Récupérer le nom et email de l'utilisateur si possible
    // Pour l'instant, on utilise l'ID
    await sendAlerts({
      action,
      user: {
        id: user.id,
        name: user.id, // TODO: Récupérer le vrai nom depuis la BDD
        email: user.id, // TODO: Récupérer le vrai email depuis la BDD
      },
      details,
      ipAddress,
      userAgent,
      mosqueId,
    })
  } catch (error) {
    // Les erreurs d'alerte ne doivent pas bloquer l'action
    console.error("Failed to send critical alert:", error)
  }
}

/**
 * Vérifie si une action est considérée comme sensible
 */
export function isSensitiveAction(action: string): boolean {
  const sensitiveActions = [
    AUDIT_ACTIONS.USER_DELETE,
    AUDIT_ACTIONS.MOSQUE_DELETE,
    AUDIT_ACTIONS.MFA_DISABLED,
    AUDIT_ACTIONS.EMERGENCY_RECOVERY_COMPLETED,
    "user.update.role", // Changement de rôle
    "mosque.update.subscription", // Modification d'abonnement
  ]

  return sensitiveActions.includes(action as any) || action.startsWith("super_admin.")
}
