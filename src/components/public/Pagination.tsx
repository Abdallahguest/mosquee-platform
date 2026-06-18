import { Link } from "@/i18n/navigation"

interface PaginationProps {
  /** Page courante (1-indexée). */
  page: number
  /** Nombre d'éléments par page. */
  perPage: number
  /** Total d'éléments (pour savoir s'il existe une page suivante). */
  total: number
  /** Chemin de base, ex. "/m/taqwa/announcements". */
  basePath: string
  /** Paramètres d'URL à conserver (ex. { filter: "past" }). */
  extraParams?: Record<string, string>
  /** Libellés traduits. */
  labels: { previous: string; next: string; pageInfo: string }
}

// Pagination "Précédent / Suivant" par URL (?page=N). Pas de JavaScript :
// ce sont de simples liens, robustes même sur connexion lente. Rendu seulement
// utile s'il y a plus d'une page.
export default function Pagination({
  page,
  perPage,
  total,
  basePath,
  extraParams = {},
  labels,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(Math.max(1, page), totalPages)

  if (totalPages <= 1) return null

  const buildHref = (p: number) => {
    const params = new URLSearchParams(extraParams)
    if (p > 1) params.set("page", String(p))
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  const hasPrev = current > 1
  const hasNext = current < totalPages

  return (
    <nav className="flex items-center justify-between gap-3 pt-2" aria-label="Pagination">
      {hasPrev ? (
        <Link
          href={buildHref(current - 1)}
          className="inline-flex items-center text-sm font-medium text-green-700 hover:text-green-800"
        >
          <span aria-hidden="true">←&nbsp;</span>{labels.previous}
        </Link>
      ) : (
        <span className="text-sm text-gray-300 select-none">
          <span aria-hidden="true">←&nbsp;</span>{labels.previous}
        </span>
      )}

      <span className="text-xs text-gray-400">
        {labels.pageInfo}
      </span>

      {hasNext ? (
        <Link
          href={buildHref(current + 1)}
          className="inline-flex items-center text-sm font-medium text-green-700 hover:text-green-800"
        >
          {labels.next}<span aria-hidden="true">&nbsp;→</span>
        </Link>
      ) : (
        <span className="text-sm text-gray-300 select-none">
          {labels.next}<span aria-hidden="true">&nbsp;→</span>
        </span>
      )}
    </nav>
  )
}
