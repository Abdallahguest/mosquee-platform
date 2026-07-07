"use client"

// Lecteur audio léger pour les pages publiques annonces/événements.
// Rendu uniquement si un audioUrl est présent.

interface AudioPlayerProps {
  url: string
  label?: string
  listenLabel?: string
  openLabel?: string
}

export default function AudioPlayer({
  url,
  label = "Message audio",
  listenLabel,
  openLabel,
}: AudioPlayerProps) {
  const displayLabel = listenLabel ?? label

  return (
    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 space-y-2">
      <p className="text-xs font-medium text-green-800 flex items-center gap-1.5">
        <span aria-hidden="true">🔊</span>
        {displayLabel}
      </p>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        controls
        src={url}
        className="w-full"
        aria-label={displayLabel}
        preload="metadata"
      />
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
      <p className="text-[11px] text-green-600">
        Message audio de la mosquée · Appuyez sur ▶ pour écouter
      </p>
    </div>
  )
}
