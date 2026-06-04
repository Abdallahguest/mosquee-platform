import { Link } from "@/i18n/navigation"

interface BackLinkProps {
  /** Destination (chemin localisé, sans préfixe de langue) */
  href: string
  /** Libellé déjà traduit (ex. t("backToAnnouncements")) */
  label: string
}

// Lien de retour réutilisable. La flèche s'inverse automatiquement en RTL
// (← en LTR, → en arabe) via les variantes rtl: de Tailwind.
// Reprend le pattern déjà utilisé dans les pages d'édition admin, centralisé ici.
export default function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
    >
      <span aria-hidden="true" className="rtl:hidden">←&nbsp;</span>
      {label}
      <span aria-hidden="true" className="hidden rtl:inline">&nbsp;→</span>
    </Link>
  )
}
