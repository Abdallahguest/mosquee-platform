"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import LogoutButton from "@/components/LogoutButton"

export default function SuperAdminNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navLinks = [
    { href: "/super-admin", label: "Tableau de bord" },
    { href: "/super-admin/mosques", label: "Mosquées" },
    { href: "/super-admin/users", label: "Comptes" },
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
            <span style={{ color: "#AFA9EC" }}>🛡️</span>
            <span>Super-Admin</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
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

          <div className="hidden md:flex items-center gap-3">
            <Link href="/admin" className="text-xs" style={{ color: "#CECBF6" }}>
              ← Mon admin
            </Link>
            <LogoutButton />
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-2xl leading-none"
            aria-label="Menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
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
            <Link href="/admin" className="text-sm px-3 py-2" style={{ color: "#CECBF6" }}>
              ← Mon admin
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
