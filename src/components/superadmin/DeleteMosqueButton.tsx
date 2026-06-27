"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { deleteMosque } from "@/lib/actions/superadmin.actions"
import { Button } from "@/components/ui/button"

interface DeleteMosqueButtonProps {
  mosqueId: number
  mosqueName: string
  stats: { announcements: number; events: number; members: number; admins: number }
}

export default function DeleteMosqueButton({ mosqueId, mosqueName, stats }: DeleteMosqueButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [error, setError]     = useState("")

  const totalLinked = stats.announcements + stats.events + stats.members + stats.admins

  async function handleDelete() {
    setLoading(true)
    setError("")
    const result = await deleteMosque(mosqueId)
    setLoading(false)
    if (!result.success) {
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
    <div className="flex flex-col gap-2 text-end">
      <p className="text-xs text-red-700 max-w-55">
        Supprimer <strong>{mosqueName}</strong> ?
        {totalLinked > 0 && (
          <>
            {" "}Cela effacera aussi {stats.announcements} annonce(s), {stats.events} événement(s),{" "}
            {stats.members} membre(s) et retirera {stats.admins} admin(s). Action irréversible.
          </>
        )}
      </p>
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
          Annuler
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={loading}
          className="text-red-600"
        >
          {loading ? "Suppression..." : "Oui, supprimer"}
        </Button>
      </div>
    </div>
  )
}
