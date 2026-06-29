"use client"

import { useState } from "react"
import { Link } from "@/i18n/navigation"
import type { Mosque } from "@/db/schema"

interface Props {
  mosques: Pick<Mosque, "slug" | "name" | "city" | "country">[]
  searchPlaceholder: string
  noResultsLabel: string
}

export default function MosqueSearch({ mosques, searchPlaceholder, noResultsLabel }: Props) {
  const [query, setQuery] = useState("")

  const filtered = query.trim() === ""
    ? mosques
    : mosques.filter((m) => {
        const q = query.toLowerCase()
        return m.name.toLowerCase().includes(q) || m.city.toLowerCase().includes(q)
      })

  return (
    <div className="space-y-3">
      {/* Champ de recherche — affiché seulement s'il y a au moins 5 mosquées */}
      {mosques.length >= 5 && (
        <div className="relative">
          <span
            className="absolute inset-y-0 start-3 flex items-center text-gray-400 pointer-events-none"
            aria-hidden="true"
          >
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full ps-9 pe-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            aria-label={searchPlaceholder}
          />
        </div>
      )}

      {/* Liste filtrée */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">{noResultsLabel}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((mosque) => (
            <Link
              key={mosque.slug}
              href={`/m/${mosque.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm hover:border-green-300 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors text-sm">
                  {mosque.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{mosque.city}, {mosque.country}</p>
              </div>
              <span
                className="text-gray-400 rtl:rotate-180 group-hover:text-green-700 transition-colors"
                aria-hidden="true"
              >→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
