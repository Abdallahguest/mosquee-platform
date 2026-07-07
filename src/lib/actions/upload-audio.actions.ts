"use server"

import { getSessionMosque } from "@/lib/auth-helpers"
import { uploadAudio, deleteAudio, extractKeyFromUrl } from "@/lib/r2"
import type { ActionResult } from "./action-result"

const MAX_SIZE_BYTES = 5 * 1024 * 1024  // 5 Mo max (3 min audio ~= 2-3 Mo en webm)
const ALLOWED_TYPES  = ["audio/webm", "audio/mp4", "audio/ogg", "audio/mpeg", "audio/wav"]

/**
 * Upload un fichier audio vers R2.
 * Appelée depuis le formulaire admin après enregistrement ou sélection de fichier.
 * Retourne l'URL publique à stocker dans audioUrl.
 */
export async function uploadAudioFile(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  const { session, mosqueId } = await getSessionMosque()
  if (!mosqueId) return { success: false, error: "NO_MOSQUE" }

  const file = formData.get("audio") as File | null
  if (!file || file.size === 0) return { success: false, error: "AUDIO_MISSING" }

  if (file.size > MAX_SIZE_BYTES) {
    return { success: false, error: "AUDIO_TOO_LARGE" }
  }

  const mimeType = file.type || "audio/webm"
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return { success: false, error: "AUDIO_INVALID_TYPE" }
  }

  // Extension depuis le mime type
  const ext = mimeType.split("/")[1]?.split(";")[0] ?? "webm"
  const timestamp = Date.now()
  const userId = session.user.id.slice(0, 8)
  const key = `mosques/${mosqueId}/audio/${timestamp}-${userId}.${ext}`

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const url = await uploadAudio(key, buffer, mimeType)
    return { success: true, data: { url } }
  } catch (error) {
    console.error("Erreur upload R2:", error)
    return { success: false, error: "AUDIO_UPLOAD_FAILED" }
  }
}

/**
 * Supprime un fichier audio de R2.
 * Appelée quand on remplace ou supprime un audio existant.
 */
export async function deleteAudioFile(url: string): Promise<ActionResult> {
  await getSessionMosque()

  const key = extractKeyFromUrl(url)
  if (!key) return { success: false, error: "AUDIO_KEY_NOT_FOUND" }

  try {
    await deleteAudio(key)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "AUDIO_DELETE_FAILED" }
  }
}
