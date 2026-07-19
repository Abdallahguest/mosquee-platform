/**
 * Module MFA (Multi-Factor Authentication) - TOTP
 * 
 * Gère la création et validation des codes TOTP pour les super-admins.
 * Utilise otpauth pour la génération et vérification des codes.
 */

import { Secret, TOTP } from "otpauth"

export interface TOTPSetupResult {
  secret: string
  qrCodeUrl: string
  recoveryCodes: string[]
}

/**
 * Génère un nouveau secret TOTP et des codes de récupération
 */
export function generateTOTPSecret(email: string): TOTPSetupResult {
  // Générer un secret aléatoire de 32 caractères (base32)
  const secret = new Secret({ size: 20 }).base32
  
  // Créer l'instance TOTP
  const totp = new TOTP({
    issuer: "Amana Connect",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  })
  
  // Générer l'URL QR code
  const qrCodeUrl = totp.toString()
  
  // Générer 10 codes de récupération
  const recoveryCodes = Array.from({ length: 10 }, () => 
    crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase()
  )
  
  return {
    secret,
    qrCodeUrl,
    recoveryCodes,
  }
}

/**
 * Vérifie un code TOTP
 */
export function verifyTOTPCode(secret: string, token: string): boolean {
  try {
    const totp = new TOTP({
      issuer: "Amana Connect",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(secret),
    })
    
    // Vérifier avec une fenêtre de 1 période (30s avant/après) pour tolérer les décalages d'horloge
    const delta = 1
    return totp.validate({ token, window: delta }) !== null
  } catch {
    return false
  }
}

/**
 * Vérifie un code de récupération
 */
export function verifyRecoveryCode(
  storedCodes: string | null,
  providedCode: string
): { valid: boolean; remainingCodes?: string[] } {
  if (!storedCodes) {
    return { valid: false }
  }
  
  try {
    const codes = JSON.parse(storedCodes) as string[]
    const normalizedProvided = providedCode.toUpperCase().replace(/[^A-Z0-9]/g, "")
    
    const index = codes.findIndex((code) => 
      code.toUpperCase().replace(/[^A-Z0-9]/g, "") === normalizedProvided
    )
    
    if (index === -1) {
      return { valid: false }
    }
    
    // Supprimer le code utilisé
    const remainingCodes = codes.filter((_, i) => i !== index)
    
    return { valid: true, remainingCodes }
  } catch {
    return { valid: false }
  }
}
