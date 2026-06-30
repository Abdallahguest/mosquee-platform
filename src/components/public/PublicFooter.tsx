import { getLocale } from "next-intl/server"
import { formatOrangeMoneyNumber } from "@/lib/orange-money"

interface PublicFooterProps {
  /** Nom déjà résolu selon la langue (via getMosqueName). Si absent, on prend mosque.name. */
  displayName?: string
  mosque: {
    name: string
    city: string
    country: string
    commune?: string | null
    quartier?: string | null
    secteur?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
    donationUrl?: string | null
    orangeMoneyNumber?: string | null
    footerText?: string | null
  }
}

export default async function PublicFooter({ mosque, displayName }: PublicFooterProps) {
  const locale = await getLocale()
  // Le guide existe en fr/en/ar ; ce sont les 3 seules locales supportées par next-intl ici.
  const guideHref = `/guides/guide-public-${locale}.pdf`

  // Adresse complète : du plus large au plus précis, on ne montre que ce qui est rempli.
  const addressParts = [mosque.city, mosque.commune, mosque.quartier, mosque.secteur].filter(Boolean)

  return (
    <footer className="bg-green-950 text-green-100 mt-8">
      <div className="max-w-lg mx-auto px-6 py-6 space-y-3">
        <div className="text-sm">
          <p className="font-medium text-white">{displayName ?? mosque.name}</p>
          <p className="text-green-200">
            {addressParts.join(", ")}{addressParts.length > 0 ? ", " : ""}{mosque.country}
          </p>
        </div>

        {/* Texte personnalisé de pied de page (optionnel) */}
        {mosque.footerText && (
          <p className="text-xs text-green-200 whitespace-pre-line">{mosque.footerText}</p>
        )}

        {(mosque.contactEmail || mosque.contactPhone) && (
          <div className="text-xs text-green-200 space-y-0.5">
            {mosque.contactEmail && <p dir="ltr">✉ {mosque.contactEmail}</p>}
            {mosque.contactPhone && <p dir="ltr">☎ {mosque.contactPhone}</p>}
          </div>
        )}

        {mosque.orangeMoneyNumber && (
          <div className="bg-green-900/40 border border-green-700 rounded-lg px-4 py-3">
            <p className="text-xs text-green-200 mb-1">Faire un don — Orange Money</p>
            <p className="text-lg font-mono font-semibold text-white" dir="ltr">
              {formatOrangeMoneyNumber(mosque.orangeMoneyNumber)}
            </p>
            <a
              href={`tel:${mosque.orangeMoneyNumber}`}
              className="inline-block mt-2 bg-green-700 hover:bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
            >
              📞 Appeler ce numéro
            </a>
            <p className="text-[11px] text-green-300 mt-2">
              Don remis directement à la mosquée par transfert Orange Money — la plateforme ne traite et ne touche aucun argent.
            </p>
          </div>
        )}

        {mosque.donationUrl && (
          <div>
            <a
              href={mosque.donationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-700 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Faire un don
            </a>
            <p className="text-[11px] text-green-300 mt-1">
              Don géré directement par la mosquée (lien externe)
            </p>
          </div>
        )}

        <div className="border-t border-green-800 pt-3 space-y-2">
          <a
            href={guideHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-green-200 hover:text-white underline"
          >
            <span aria-hidden="true">📄</span> Guide d&apos;utilisation (PDF)
          </a>
          <p className="text-[11px] text-green-300">
            Plateforme respectueuse · sans intérêt ni tromperie · rien de caché
          </p>
        </div>
      </div>
    </footer>
  )
}
