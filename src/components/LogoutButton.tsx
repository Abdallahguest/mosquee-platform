"use client"

import { signOut } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  async function handleLogout() {
    await signOut()
    // Redirection dure — fiable quelle que soit la locale
    window.location.href = "/login"
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      Se déconnecter
    </Button>
  )
}
