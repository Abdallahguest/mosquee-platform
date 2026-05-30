import { Link } from "@/i18n/navigation"
import LanguageSwitcher from "@/components/public/LanguageSwitcher"

interface PublicNavProps {
  mosqueName: string
}

export default function PublicNav({ mosqueName }: PublicNavProps) {
  return (
    <nav className="bg-green-800 text-white">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold min-w-0">
            <span>🕌</span>
            <span className="truncate">{mosqueName}</span>
          </Link>
          <LanguageSwitcher variant="onGreen" />
        </div>
      </div>
    </nav>
  )
}
