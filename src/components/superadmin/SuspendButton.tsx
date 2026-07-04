"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { suspendSubscription } from "@/lib/actions/subscription.actions"
import { showToast } from "@/components/ui/toast-provider"
import { Button } from "@/components/ui/button"

export default function SuspendButton({ mosqueId, mosqueName }: { mosqueId: number; mosqueName: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSuspend() {
    setLoading(true)
    const result = await suspendSubscription(mosqueId)
    setLoading(false)
    if (!result.success) {
      showToast(result.error, "error")
      setConfirm(false)
      return
    }
    showToast(`${mosqueName} suspendu.`, "info")
    router.refresh()
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-xs text-red-600 hover:underline"
      >
        Suspendre l'accès
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500">Suspendre {mosqueName} ?</span>
      <Button variant="ghost" size="sm" onClick={handleSuspend} disabled={loading} className="text-red-600 text-xs">
        {loading ? "..." : "Oui"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirm(false)} className="text-xs">
        Non
      </Button>
    </div>
  )
}
