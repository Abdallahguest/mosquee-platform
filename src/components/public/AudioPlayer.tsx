import { isDirectAudioFile } from "@/lib/audio-link"

interface AudioPlayerProps {
  url: string
  /** Libellés traduits passés par le parent (composant serveur). */
  listenLabel: string   // ex. "Écouter le message"
  openLabel: string     // ex. "Ouvrir l'audio"
}

// Affiche un lecteur <audio> si l'URL est un fichier direct, sinon un lien
// cliquable. Aucun fichier n'est stocké : on ne fait que pointer vers l'URL.
export default function AudioPlayer({ url, listenLabel, openLabel }: AudioPlayerProps) {
  if (!url) return null

  if (isDirectAudioFile(url)) {
    return (
      <div className="mt-2">
        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
          <span aria-hidden="true">🔊</span> {listenLabel}
        </p>
        {/* preload="none" : on ne télécharge pas l'audio tant que l'utilisateur ne lance pas la lecture. */}
        <audio controls preload="none" className="w-full" src={url}>
          {/* Repli si la balise audio n'est pas supportée */}
          <a href={url} target="_blank" rel="noopener noreferrer">{openLabel}</a>
        </audio>
      </div>
    )
  }

  // Lien externe non lisible directement (WhatsApp, YouTube, Drive…) : lien cliquable.
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 hover:underline"
    >
      <span aria-hidden="true">🔊</span> {listenLabel}
      <span aria-hidden="true">↗</span>
    </a>
  )
}
