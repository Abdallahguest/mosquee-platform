"use client"

import { useState } from "react"

interface AudioPlayerProps {
  url: string
  label?: string
  listenLabel?: string
  openLabel?: string
}

export default function AudioPlayer({
  url,
  listenLabel,
  openLabel,
}: AudioPlayerProps) {
  const displayLabel = listenLabel ?? "Écouter le message"
  const [audioError, setAudioError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 space-y-3">
      <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
        <span aria-hidden="true">🔊</span>
        {displayLabel}
      </p>

      {/* Lecteur natif — crossOrigin anonymous pour permettre le chargement R2 */}
      {!audioError ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio
          controls
          src={url}
          className="w-full"
          crossOrigin="anonymous"
          preload="metadata"
          onCanPlay={() => setLoaded(true)}
          onError={() => setAudioError(true)}
          style={{ minHeight: "40px" }}
        />
      ) : null}

      {/* Fallback si le lecteur natif ne charge pas (CORS, format, etc.) */}
      {(audioError || !loaded) && (
        <div className={`space-y-2 ${!audioError ? "hidden" : ""}`}>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Le lecteur intégré ne peut pas charger cet audio sur votre appareil.
            Appuyez sur le bouton ci-dessous pour l&apos;écouter.
          </p>
        </div>
      )}

      {/* Bouton principal — téléchargement/lecture native */}
      <a
        href={url}
        download
        className="flex items-center justify-center gap-2 w-full bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        onClick={(e) => {
          // Sur mobile : essayer d'ouvrir directement (lecture) plutôt que télécharger
          if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
            e.preventDefault()
            window.open(url, "_blank", "noopener")
          }
        }}
      >
        <span aria-hidden="true">▶</span>
        Écouter l&apos;audio
      </a>

      {openLabel && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-green-700 hover:underline inline-flex items-center gap-1"
        >
          {openLabel} ↗
        </a>
      )}
    </div>
  )
}
