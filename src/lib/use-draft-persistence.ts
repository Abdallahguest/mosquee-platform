"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// ─────────────────────────────────────────────────────────────────────────────
// useDraftPersistence — Écriture résiliente Niveau A
//
// Objectif : ne JAMAIS perdre ce que l'admin a saisi, même si l'envoi échoue
// (réseau coupé, erreur serveur). Pas de synchronisation automatique en
// arrière-plan (ce serait le Niveau B) : juste une sauvegarde locale fiable
// et une restauration sur demande.
//
// Principe (champs NON contrôlés préservés) :
//  1. Sauvegarde PÉRIODIQUE : on lit le <form> via FormData à intervalle régulier
//     et on écrit dans localStorage. Aucun useState par champ, aucun onChange.
//  2. À l'ouverture : s'il existe un brouillon, le hook le signale (hasDraft).
//     C'est au composant d'afficher « Récupérer le brouillon ? » et d'appeler
//     restoreDraft() si l'admin accepte.
//  3. Envoi réussi → clearDraft() : le brouillon est effacé.
//  4. Envoi échoué → on ne touche à rien : le brouillon reste pour réessai.
//
// Anti-gharar : le brouillon porte sa date (savedAt), affichable par le composant.
// ─────────────────────────────────────────────────────────────────────────────

const PREFIX = "amana:draft:"
const SAVE_INTERVAL_MS = 3000 // sauvegarde toutes les 3 secondes

export interface DraftData {
  values: Record<string, string>
  savedAt: string // ISO
}

interface UseDraftPersistenceOptions {
  // Clé unique du formulaire (ex: "announcement:new", "announcement:edit:12").
  // Permet de distinguer création / édition / formulaires différents.
  formKey: string
  // Référence au <form> dont on lit les champs.
  formRef: React.RefObject<HTMLFormElement | null>
  // Désactive la persistance (ex: en mode édition si on ne veut pas de brouillon).
  enabled?: boolean
}

interface UseDraftPersistenceResult {
  // true s'il existe un brouillon enregistré pour ce formulaire au montage.
  hasDraft: boolean
  // Date d'enregistrement du brouillon trouvé (pour affichage), ou null.
  draftSavedAt: string | null
  // Réinjecte les valeurs du brouillon dans les champs du formulaire.
  restoreDraft: () => void
  // Efface le brouillon (à appeler après un envoi réussi).
  clearDraft: () => void
  // Ignore le brouillon trouvé sans l'effacer du stockage immédiatement
  // (masque juste la proposition de restauration).
  dismissDraft: () => void
}

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage
  } catch {
    return false
  }
}

// Lit les champs texte du formulaire via FormData (champs non contrôlés).
function readForm(form: HTMLFormElement): Record<string, string> {
  const data = new FormData(form)
  const values: Record<string, string> = {}
  for (const [key, value] of data.entries()) {
    // On ne garde que les valeurs texte (pas les fichiers).
    if (typeof value === "string") values[key] = value
  }
  return values
}

// Vrai si au moins un champ a du contenu (évite de sauver un formulaire vide).
function isNonEmpty(values: Record<string, string>): boolean {
  return Object.values(values).some((v) => v.trim().length > 0)
}

export function useDraftPersistence({
  formKey,
  formRef,
  enabled = true,
}: UseDraftPersistenceOptions): UseDraftPersistenceResult {
  const storageKey = PREFIX + formKey

  const [hasDraft, setHasDraft] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)
  // Garde la dernière sérialisation écrite, pour éviter d'écrire inutilement.
  const lastSavedRef = useRef<string>("")

  // ── Au montage : détecter un brouillon existant ──
  useEffect(() => {
    if (!enabled || !hasStorage()) return
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const draft = JSON.parse(raw) as DraftData
        if (draft && isNonEmpty(draft.values)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setHasDraft(true)
          setDraftSavedAt(draft.savedAt)
        }
      }
    } catch {
      // brouillon illisible : on l'ignore.
    }
  }, [storageKey, enabled])

  // ── Sauvegarde périodique en lisant le formulaire ──
  useEffect(() => {
    if (!enabled || !hasStorage()) return

    const interval = setInterval(() => {
      const form = formRef.current
      if (!form) return

      const values = readForm(form)
      if (!isNonEmpty(values)) return // ne pas sauver un formulaire vide

      const serialized = JSON.stringify(values)
      if (serialized === lastSavedRef.current) return // rien n'a changé

      try {
        const draft: DraftData = { values, savedAt: new Date().toISOString() }
        localStorage.setItem(storageKey, JSON.stringify(draft))
        lastSavedRef.current = serialized
      } catch {
        // quota dépassé ou stockage indisponible : échec silencieux.
      }
    }, SAVE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [storageKey, formRef, enabled])

  // ── Restaurer le brouillon dans les champs ──
  const restoreDraft = useCallback(() => {
    if (!hasStorage()) return
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return
      const draft = JSON.parse(raw) as DraftData
      const form = formRef.current
      if (!form) return

      // Réinjecter chaque valeur dans le champ correspondant.
      for (const [name, value] of Object.entries(draft.values)) {
        const field = form.elements.namedItem(name)
        if (
          field instanceof HTMLInputElement ||
          field instanceof HTMLTextAreaElement ||
          field instanceof HTMLSelectElement
        ) {
          if (field instanceof HTMLInputElement && field.type === "checkbox") {
            field.checked = value === "true" || value === "on"
          } else {
            field.value = value
          }
        }
      }
      setHasDraft(false)
    } catch {
      // restauration impossible : on laisse le formulaire en l'état.
    }
  }, [storageKey, formRef])

  // ── Effacer le brouillon (après envoi réussi) ──
  const clearDraft = useCallback(() => {
    if (!hasStorage()) return
    try {
      localStorage.removeItem(storageKey)
      lastSavedRef.current = ""
      setHasDraft(false)
      setDraftSavedAt(null)
    } catch {
      // ignore
    }
  }, [storageKey])

  // ── Ignorer la proposition de restauration — EFFACE définitivement ──
  const dismissDraft = useCallback(() => {
    // On efface le brouillon plutôt que de juste masquer la bannière.
    // Sinon l'admin verrait la même proposition à chaque rechargement.
    clearDraft()
  }, [clearDraft])
}
