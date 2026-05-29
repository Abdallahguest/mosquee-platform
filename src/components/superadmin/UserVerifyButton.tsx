"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { setUserVerified } from "@/lib/actions/superadmin.actions"
import { Button } from "@/components/ui/button"

export default function UserVerifyButton({ userId, verified }: { userId: string; verified: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    await setUserVerified(userId, !verified)
    setLoading(false)
    router.refresh()
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleToggle} disabled={loading}>
      {loading ? "..." : verified ? "Dé-vérifier" : "Vérifier"}
    </Button>
  )
}
