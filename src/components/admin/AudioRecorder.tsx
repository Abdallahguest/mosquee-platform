"use client"

import { useState, useRef, useCallback } from "react"
import { uploadAudioFile, deleteAudioFile } from "@/lib/actions/upload-audio.actions"
import { showToast } from "@/components/ui/toast-provider"

const MAX_SIZE_BYTES = 5 * 1024 * 1024  // 5 Mo

interface AudioRecorderProps {
  // URL audio actuelle (si édition)
  currentAudioUrl?: string | null
  // Appelé quand l'URL change (upload réussi ou suppression)
  onAudioUrlChange: (url: string | null) => void
  label?: string
}

type RecordingState = "idle" | "uploading" | "done"

export default function AudioRecorder({
  currentAudioUrl,
  onAudioUrlChange,
  label = "Audio",
}: AudioRecorderProps) {
  const [state, setState]       = useState<RecordingState>(currentAudioUrl ? "done" : "idle")
  const [audioUrl, setAudioUrl] = useState<string | null>(currentAudioUrl ?? null)
  const [error, setError]       = useState("")

  const previewRef  = useRef<string | null>(null)
  const audioUrlRef = useRef<string | null>(currentAudioUrl ?? null)

  const deletePreviousIfR2 = useCallback(async (url: string | null) => {
    if (!url) return
    if (url.includes("r2.dev") || url.includes("cloudflarestorage")) {
      await deleteAudioFile(url).catch(() => {})
    }
  }, [])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")

    if (file.size > MAX_SIZE_BYTES) {
      setError("Fichier trop volumineux (maximum 5 Mo).")
      return
    }

    await deletePreviousIfR2(audioUrlRef.current)

    setState("uploading")
    const formData = new FormData()
    formData.append("audio", file, file.name)

    const result = await uploadAudioFile(formData)

    if (!result.success) {
      setError(result.error)
      setState("idle")
      showToast(result.error, "error")
      return
    }

    setAudioUrl(result.data.url)
    audioUrlRef.current = result.data.url
    onAudioUrlChange(result.data.url)
    setState("done")
    showToast("Audio envoyé avec succès.", "success")
  }, [onAudioUrlChange, deletePreviousIfR2])

  const handleDelete = useCallback(async () => {
    const url = audioUrlRef.current
    if (!url) return
    if (url.includes("r2.dev") || url.includes("cloudflarestorage")) {
      await deleteAudioFile(url).catch(() => {})
    }
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = null
    }
    setAudioUrl(null)
    audioUrlRef.current = null
    onAudioUrlChange(null)
    setState("idle")
  }, [onAudioUrlChange])

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>

      {state === "idle" && (
        <div className="space-y-2">
          <label className="flex items-center justify-center gap-2 w-full cursor-pointer bg-green-700 hover:bg-green-800 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-colors">
            <span aria-hidden="true">🎤</span>
            Enregistrer un audio
            <input
              type="file"
              accept="audio/*,.m4a,.aac,.amr,.3gp"
              capture="user"
              className="sr-only"
              onChange={handleFileSelect}
            />
          </label>

          <label className="flex items-center justify-center gap-2 w-full cursor-pointer border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors">
            <span aria-hidden="true">📎</span>
            Choisir un fichier audio existant
            <input
              type="file"
              accept="audio/*,.m4a,.aac,.amr,.3gp"
              className="sr-only"
              onChange={handleFileSelect}
            />
          </label>

          <p className="text-xs text-muted-foreground text-center">
            Maximum 3 min · MP3, M4A, MP4, OGG, AAC, WebM
          </p>
        </div>
      )}

      {state === "uploading" && (
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <span className="animate-spin" aria-hidden="true">⏳</span>
          Envoi de l&apos;audio en cours…
        </div>
      )}

      {state === "done" && audioUrl && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-green-800 flex items-center gap-1.5">
              <span aria-hidden="true">✅</span>
              Audio enregistré
            </p>
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs text-red-600 hover:underline"
            >
              Supprimer
            </button>
          </div>
          <audio controls src={audioUrl} className="w-full h-8" crossOrigin="anonymous" />
          <a
            href={audioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-700 hover:underline"
          >
            ▶ Écouter dans le navigateur
          </a>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
