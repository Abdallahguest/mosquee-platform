interface PublicFooterProps {
  mosque: {
    name: string
    city: string
    country: string
    contactEmail?: string | null
    contactPhone?: string | null
    donationUrl?: string | null
  }
}

export default function PublicFooter({ mosque }: PublicFooterProps) {
  return (
    <footer className="bg-green-950 text-green-100 mt-8">
      <div className="max-w-lg mx-auto px-6 py-6 space-y-3">
        <div className="text-sm">
          <p className="font-medium text-white">{mosque.name}</p>
          <p className="text-green-200">{mosque.city}, {mosque.country}</p>
        </div>

        {(mosque.contactEmail || mosque.contactPhone) && (
          <div className="text-xs text-green-200 space-y-0.5">
            {mosque.contactEmail && <p>✉ {mosque.contactEmail}</p>}
            {mosque.contactPhone && <p>☎ {mosque.contactPhone}</p>}
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
            <p className="text-[11px] text-green-400 mt-1">
              Don géré directement par la mosquée (lien externe)
            </p>
          </div>
        )}

        <div className="border-t border-green-800 pt-3">
          <p className="text-[11px] text-green-400">
            Plateforme halal · Sans riba · Sans ghich · Sans jahàla
          </p>
        </div>
      </div>
    </footer>
  )
}
