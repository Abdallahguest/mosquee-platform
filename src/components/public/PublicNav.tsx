import { Link } from "@/i18n/navigation"
import LanguageSwitcher from "@/components/public/LanguageSwitcher"

interface PublicNavProps {
  mosqueName: string
}

export default function PublicNav({ mosqueName }: PublicNavProps) {
  return (
    <nav className="bg-green-800 text-white">
      {/* max-w aligné sur le contenu des pages (corrige U1) */}
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold min-w-0 flex-1">
            <span aria-hidden="true" className="shrink-0">🕌</span>
            <span className="leading-tight">{mosqueName}</span>
          </Link>
          <LanguageSwitcher variant="onGreen" />
        </div>
      </div>
    </nav>
  )
}
