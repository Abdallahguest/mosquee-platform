"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import LogoutButton from "@/components/LogoutButton"

interface AdminNavProps {
  mosqueName?: string
  mosqueSlug?: string
}

export default function AdminNav({ mosqueName, mosqueSlug }: AdminNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navLinks = [
    { href: "/admin", label: "Tableau de bord" },
    { href: "/admin/announcements", label: "Annonces" },
    { href: "/admin/events", label: "Événements" },
    { href: "/admin/settings", label: "Paramètres" },
  ]

  // Section active : correspondance exacte pour /admin, sinon préfixe
  const isActive = (href: string) =>
    href === "/admin" ? pathname.endsWith("/admin") : pathname.includes(href)

  return (
    <nav className="bg-green-800 text-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo / nom mosquée */}
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <span>🕌</span>
            <span className="truncate max-w-[160px]">{mosqueName ?? "Administration"}</span>
          </Link>

          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                  isActive(link.href)
                    ? "bg-green-950 text-white"
                    : "text-green-100 hover:bg-green-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3">
            {mosqueSlug && (
              <Link
                href={`/m/${mosqueSlug}`}
                target="_blank"
                className="text-xs text-green-100 hover:text-white"
              >
                Voir le site ↗
              </Link>
            )}
            <LogoutButton />
          </div>

          {/* Bouton hamburger mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-2xl leading-none"
            aria-label="Menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* Menu mobile déroulant */}
        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-sm px-3 py-2 rounded-md ${
                  isActive(link.href)
                    ? "bg-green-950 text-white"
                    : "text-green-100 hover:bg-green-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {mosqueSlug && (
              <Link
                href={`/m/${mosqueSlug}`}
                target="_blank"
                className="text-sm px-3 py-2 text-green-100"
              >
                Voir le site ↗
              </Link>
            )}
            <div className="px-3 pt-2">
              <LogoutButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
