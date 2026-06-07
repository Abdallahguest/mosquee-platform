interface PublicFooterProps {
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
    footerText?: string | null
  }
}

export default function PublicFooter({ mosque }: PublicFooterProps) {
  // Adresse complète : du plus large au plus précis, on ne montre que ce qui est rempli.
  const addressParts = [mosque.city, mosque.commune, mosque.quartier, mosque.secteur].filter(Boolean)

  return (
    <footer className="bg-green-950 text-green-100 mt-8">
      <div className="max-w-lg mx-auto px-6 py-6 space-y-3">
        <div className="text-sm">
          <p className="font-medium text-white">{mosque.name}</p>
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

        <div className="border-t border-green-800 pt-3">
          <p className="text-[11px] text-green-300">
            Plateforme respectueuse · sans intérêt ni tromperie · rien de caché
          </p>
        </div>
      </div>
    </footer>
  )
}
