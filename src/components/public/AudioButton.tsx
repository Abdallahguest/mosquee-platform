"use client"

// Bouton audio léger — ouvre l'audio nativement sur mobile sans quitter la PWA.
export default function AudioButton({ url, label }: { url: string; label: string }) {
  function handleClick(e: React.MouseEvent) {
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
      e.preventDefault()
      window.open(url, "_blank", "noopener")
    }
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-100 transition-colors"
    >
      <span aria-hidden="true">🔊</span>
      {label}
    </a>
  )
}
