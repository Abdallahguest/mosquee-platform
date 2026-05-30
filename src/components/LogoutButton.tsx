"use client"

import { signOut } from "@/lib/auth-client"

export default function LogoutButton() {
  async function handleLogout() {
    await signOut()
    // Redirection dure — fiable quelle que soit la locale
    window.location.href = "/login"
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-white border border-white/40 hover:bg-white/10 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap"
    >
      Se déconnecter
    </button>
  )
}
