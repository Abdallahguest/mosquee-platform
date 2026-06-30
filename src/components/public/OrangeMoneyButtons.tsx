"use client"

import { useState } from "react"

interface OrangeMoneyButtonsProps {
  /** Numéro normalisé (sans espaces) ex: "622123456" */
  number: string
  /** Numéro formaté pour l'affichage ex: "622 12 34 56" */
  formatted: string
}

export default function OrangeMoneyButtons({ number, formatted }: OrangeMoneyButtonsProps) {
  const [copied, setCopied] = useState(false)

  // Lien USSD Orange Money Guinée : *144*1*1*NUMERO#
  // Pré-remplit le composeur avec le menu de dépôt vers ce numéro.
  // Le fidèle entre ensuite le montant et son code secret sur son téléphone.
  // %23 = # encodé URL.
  const ussdHref = `tel:*144*1*1*${number}%23`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback pour les navigateurs sans accès clipboard
      const el = document.createElement("input")
      el.value = number
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="bg-green-900/40 border border-green-700 rounded-lg px-4 py-3 space-y-3">
      <p className="text-xs text-green-200">Faire un don — Orange Money</p>

      {/* Numéro en clair — anti-jahàla */}
      <p className="text-lg font-mono font-semibold text-white" dir="ltr">
        {formatted}
      </p>

      {/* Bouton A — USSD pré-rempli (Android principalement) */}
      <a
        href={ussdHref}
        className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors w-full text-center"
      >
        <span aria-hidden="true">🟠</span>
        Déposer via Orange Money
      </a>

      {/* Bouton C — Copier le numéro */}
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors w-full"
      >
        <span aria-hidden="true">{copied ? "✓" : "📋"}</span>
        {copied ? "Numéro copié !" : "Copier le numéro"}
      </button>

      <p className="text-[11px] text-green-300 leading-relaxed">
        Don remis directement à la mosquée par transfert Orange Money.<br />
        La plateforme ne traite et ne touche aucun argent.
      </p>
    </div>
  )
}
