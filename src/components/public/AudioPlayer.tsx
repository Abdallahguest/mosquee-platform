"use client"

// Lecteur audio pour les pages de détail.
// Sur mobile : ouvre l'audio nativement (plus fiable que le lecteur HTML5 intégré
// qui peut bloquer à cause des restrictions CORS ou des formats M4A).

interface AudioPlayerProps {
  url: string
  label?: string
  listenLabel?: string
  openLabel?: string
}

export default function AudioPlayer({
  url,
  listenLabel,
}: AudioPlayerProps) {
  const displayLabel = listenLabel ?? "Écouter le message"

  function handlePlay(e: React.MouseEvent) {
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
      e.preventDefault()
      window.open(url, "_blank", "noopener")
    }
  }

  return (
    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-4 space-y-3">
      <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
        <span aria-hidden="true">🔊</span>
        {displayLabel}
      </p>

      {/* Lecteur natif HTML5 — fonctionne sur desktop et certains mobiles */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        controls
        src={url}
        className="w-full"
        preload="none"
        style={{ minHeight: "40px" }}
      />

      {/* Bouton principal — toujours visible, ouvre nativement sur mobile */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handlePlay}
        className="flex items-center justify-center gap-2 w-full bg-green-700 hover:bg-green-800 active:bg-green-900 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors"
      >
        <span aria-hidden="true">▶</span>
        Appuyez ici pour écouter
      </a>

      <p className="text-[11px] text-green-600 text-center">
        Message audio de la mosquée
      </p>
    </div>
  )
}
