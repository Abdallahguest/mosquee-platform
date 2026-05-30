import { Link } from "@/i18n/navigation"

export default function HomeFooter() {
  return (
    <footer className="bg-green-950 text-green-100 mt-12">
      <div className="max-w-lg mx-auto px-6 py-6 space-y-3 text-center">
        <div className="flex items-center justify-center gap-4 text-sm">
          <Link href="/login" className="text-green-200 hover:text-white transition-colors">
            Accès administration →
          </Link>
          <Link href="/privacy" className="text-green-200 hover:text-white transition-colors">
            Confidentialité
          </Link>
        </div>
        <div className="border-t border-green-800 pt-3">
          <p className="text-[11px] text-green-400">
            Plateforme halal · Sans riba · Sans ghich · Sans jahàla
          </p>
        </div>
      </div>
    </footer>
  )
}
