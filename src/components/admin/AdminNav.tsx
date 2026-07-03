"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { usePathname, Link } from "@/i18n/navigation"
import LogoutButton from "@/components/LogoutButton"
import LanguageSwitcher from "@/components/public/LanguageSwitcher"

interface AdminNavProps {
  mosqueName?: string
  mosqueSlug?: string
  isSuperAdmin?: boolean
}

export default function AdminNav({ mosqueName, mosqueSlug, isSuperAdmin }: AdminNavProps) {
  const t = useTranslations("admin.nav")
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navLinks = [
    { href: "/admin",               label: t("dashboard") },
    { href: "/admin/announcements", label: t("announcements") },
    { href: "/admin/events",        label: t("events") },
    { href: "/admin/members",       label: t("members") },
    { href: "/admin/settings",      label: t("settings") },
    { href: "/admin/activity",      label: t("activity") },
  ]

  // Section active : correspondance exacte pour /admin, sinon préfixe
  const isActive = (href: string) =>
    href === "/admin" ? pathname.endsWith("/admin") : pathname.includes(href)

  return (
    <nav className="bg-green-800 text-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <span aria-hidden="true">🕌</span>
            <span className="max-w-40 truncate">{mosqueName ?? t("dashboard")}</span>
          </Link>

          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
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
            {isSuperAdmin && (
              <Link
                href="/admin/select-mosque"
                className="text-xs text-amber-300 hover:text-white font-medium"
              >
                🔀 {t("selectMosque")}
              </Link>
            )}
            {mosqueSlug && (
              <Link
                href={`/m/${mosqueSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-100 hover:text-white"
              >
                {t("viewPage")} <span aria-hidden="true">↗</span>
              </Link>
            )}
            <LanguageSwitcher variant="onGreen" />
            <LogoutButton />
          </div>

          {/* Sélecteur de langue + hamburger, toujours visibles sur mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher variant="onGreen" />
            <button
              onClick={() => setOpen(!open)}
              className="text-2xl leading-none"
              aria-label={t("menu")}
              aria-expanded={open}
            >
              <span aria-hidden="true">{open ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
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
                rel="noopener noreferrer"
                className="text-sm px-3 py-2 text-green-100"
              >
                {t("viewPage")} <span aria-hidden="true">↗</span>
              </Link>
            )}
            {isSuperAdmin && (
              <Link
                href="/admin/select-mosque"
                onClick={() => setOpen(false)}
                className="text-sm px-3 py-2 text-amber-300 font-medium"
              >
                🔀 {t("selectMosque")}
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
