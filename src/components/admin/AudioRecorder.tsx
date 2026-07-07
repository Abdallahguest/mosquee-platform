"use client"

import { useState, useRef, useCallback } from "react"
import { uploadAudioFile, deleteAudioFile } from "@/lib/actions/upload-audio.actions"
import { showToast } from "@/components/ui/toast-provider"
import { Button } from "@/components/ui/button"

const MAX_SECONDS = 180 // 3 minutes

interface AudioRecorderProps {
  // URL audio actuelle (si édition)
  currentAudioUrl?: string | null
  // Appelé quand l'URL change (upload réussi ou suppression)
  onAudioUrlChange: (url: string | null) => void
  label?: string
}

type RecordingState = "idle" | "recording" | "uploading" | "done"

export default function AudioRecorder({
  currentAudioUrl,
  onAudioUrlChange,
  label = "Audio",
}: AudioRecorderProps) {
  const [state, setState]         = useState<RecordingState>(currentAudioUrl ? "done" : "idle")
  const [audioUrl, setAudioUrl]   = useState<string | null>(currentAudioUrl ?? null)
  const [seconds, setSeconds]     = useState(0)
  const [error, setError]         = useState("")

  const mediaRef     = useRef<MediaRecorder | null>(null)
  const chunksRef    = useRef<Blob[]>([])
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const previewRef   = useRef<string | null>(null)

  // ── Démarrer l'enregistrement ──
  const startRecording = useCallback(async () => {
    setError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Choisir le format supporté par le navigateur
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/ogg"

      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })

        // Prévisualisation locale
        if (previewRef.current) URL.revokeObjectURL(previewRef.current)
        previewRef.current = URL.createObjectURL(blob)

        // Upload vers R2
        setState("uploading")
        const formData = new FormData()
        const ext = mimeType.split("/")[1]?.split(";")[0] ?? "webm"
        formData.append("audio", blob, `recording.${ext}`)

        const result = await uploadAudioFile(formData)

        if (!result.success) {
          setError(result.error)
          setState("idle")
          showToast(result.error, "error")
          return
        }

        setAudioUrl(result.data.url)
        onAudioUrlChange(result.data.url)
        setState("done")
        showToast("Audio enregistré avec succès.", "success")
      }

      recorder.start(200) // collecte toutes les 200ms
      mediaRef.current = recorder
      setState("recording")
      setSeconds(0)

      // Compteur + arrêt automatique à 3 min
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            stopRecording()
            return MAX_SECONDS
          }
          return s + 1
        })
      }, 1000)
    } catch {
      setError("Impossible d'accéder au microphone. Vérifiez les permissions.")
      setState("idle")
    }
  }, [onAudioUrlChange])

  // ── Arrêter l'enregistrement ──
  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRef.current?.stop()
  }, [])

  // ── Supprimer l'audio ──
  const handleDelete = useCallback(async () => {
    if (!audioUrl) return
    // Si c'est une URL R2, supprimer côté serveur
    if (audioUrl.includes("r2.dev") || audioUrl.includes("cloudflarestorage")) {
      await deleteAudioFile(audioUrl)
    }
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = null
    }
    setAudioUrl(null)
    onAudioUrlChange(null)
    setState("idle")
    setSeconds(0)
  }, [audioUrl, onAudioUrlChange])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, "0")}`
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>

      {/* État : pas d'audio */}
      {state === "idle" && (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={startRecording}
            className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
          >
            <span aria-hidden="true">🎤</span>
            Enregistrer un audio
          </Button>
          <p className="text-xs text-muted-foreground">
            Maximum 3 minutes · Parlez clairement dans le micro
          </p>
        </div>
      )}

      {/* État : enregistrement en cours */}
      {state === "recording" && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium text-red-700 flex-1">
            Enregistrement en cours… {formatTime(seconds)} / {formatTime(MAX_SECONDS)}
          </span>
          <Button
            type="button"
            size="sm"
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            ⏹ Arrêter
          </Button>
        </div>
      )}

      {/* État : upload en cours */}
      {state === "uploading" && (
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <span className="animate-spin" aria-hidden="true">⏳</span>
          Envoi de l&apos;audio en cours…
        </div>
      )}

      {/* État : audio prêt */}
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
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={audioUrl} className="w-full h-8" />
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
