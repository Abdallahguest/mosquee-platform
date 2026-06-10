// Détermine si une URL pointe vers un fichier audio lisible directement
// par une balise <audio>. Les extensions sont vérifiées en ignorant les
// paramètres de requête (après "?") et l'ancre (après "#").
//
// IMPORTANT : un lien WhatsApp, YouTube, Google Drive, etc. n'est PAS un
// fichier direct — il renverra false, et l'affichage retombera sur un
// simple lien cliquable. C'est attendu.

const AUDIO_EXTENSIONS = [".mp3", ".ogg", ".m4a", ".wav", ".aac", ".opus", ".webm"]

export function isDirectAudioFile(url: string): boolean {
  if (!url) return false
  try {
    // On isole le chemin (sans query ni hash) et on le met en minuscules.
    const u = new URL(url)
    const path = u.pathname.toLowerCase()
    return AUDIO_EXTENSIONS.some((ext) => path.endsWith(ext))
  } catch {
    // URL invalide : pas un fichier direct (sera traité comme lien/ignoré).
    return false
  }
}
