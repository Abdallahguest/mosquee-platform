"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { deleteUserAccount } from "@/lib/actions/superadmin.actions"
import { Button } from "@/components/ui/button"

export default function DeleteUserButton({
  userId,
  userName,
}: {
  userId: string
  userName: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [error, setError]     = useState("")

  async function handleDelete() {
    setLoading(true)
    setError("")
    const result = await deleteUserAccount(userId)
    setLoading(false)
    if (!result.success) {
      // Ex. "Ce compte administre encore N mosquée(s)..." → on affiche le message
      setError(result.error)
      setConfirm(false)
      return
    }
    router.refresh()
  }

  if (error) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-red-600 wrap-break-word max-w-xs">{error}</span>
        <Button variant="ghost" size="sm" onClick={() => setError("")} className="self-start text-gray-500">
          OK
        </Button>
      </div>
    )
  }

  if (!confirm) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirm(true)}
        className="text-red-600 hover:text-red-700"
      >
        Supprimer
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500">Supprimer {userName} ?</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        className="text-red-600"
      >
        {loading ? "..." : "Oui"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
        Non
      </Button>
    </div>
  )
}
