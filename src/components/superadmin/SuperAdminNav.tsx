"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import LogoutButton from "@/components/LogoutButton"

export default function SuperAdminNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const t = useTranslations("superAdmin.nav")

  const navLinks = [
    { href: "/super-admin",              label: t("dashboard") },
    { href: "/super-admin/mosques",      label: t("mosques") },
    { href: "/super-admin/users",        label: t("users") },
    { href: "/super-admin/subscriptions", label: t("subscriptions") },
    { href: "/super-admin/health",       label: t("health") },
  ]

  const isActive = (href: string) =>
    href === "/super-admin"
      ? pathname.endsWith("/super-admin")
      : pathname.includes(href)

  return (
    <nav style={{ backgroundColor: "#26215C" }} className="text-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/super-admin" className="flex items-center gap-2 font-semibold">
            <span style={{ color: "#AFA9EC" }} aria-hidden="true">🛡️</span>
            <span>Super-Admin</span>
          </Link>

          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className="text-sm px-3 py-1.5 rounded-md transition-colors"
                style={
                  isActive(link.href)
                    ? { backgroundColor: "#534AB7", color: "#fff" }
                    : { color: "#CECBF6" }
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/admin" className="text-xs" style={{ color: "#CECBF6" }}>
              {t("backToAdmin")}
            </Link>
            <LogoutButton />
          </div>

          {/* Hamburger mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-2xl leading-none"
            aria-label={t("menu")}
            aria-expanded={open}
          >
            <span aria-hidden="true">{open ? "✕" : "☰"}</span>
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
                aria-current={isActive(link.href) ? "page" : undefined}
                className="text-sm px-3 py-2 rounded-md"
                style={
                  isActive(link.href)
                    ? { backgroundColor: "#534AB7", color: "#fff" }
                    : { color: "#CECBF6" }
                }
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="text-sm px-3 py-2"
              style={{ color: "#CECBF6" }}
            >
              {t("backToAdmin")}
            </Link>
            <div className="px-3 pt-2">
              <LogoutButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
