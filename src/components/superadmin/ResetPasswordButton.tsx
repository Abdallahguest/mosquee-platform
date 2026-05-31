"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { resetUserPassword } from "@/lib/actions/superadmin.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ResetPasswordButton({ userId }: { userId: string }) {
  const router = useRouter()
  const [open, setOpen]         = useState(false)
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  async function handleReset() {
    if (password.length < 8) return
    setLoading(true)
    const formData = new FormData()
    formData.set("userId", userId)
    formData.set("newPassword", password)
    const result = await resetUserPassword(formData)
    setLoading(false)
    if (result.success) {
      setDone(true)
      setTimeout(() => { setOpen(false); setDone(false); setPassword("") }, 2500)
      router.refresh()
    }
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Réinitialiser MDP
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Nouveau mot de passe"
        className="w-44 h-8 text-sm"
      />
      <Button size="sm" onClick={handleReset} disabled={loading || password.length < 8} className="bg-green-700 hover:bg-green-800">
        {done ? "✓" : loading ? "..." : "OK"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => { setOpen(false); setPassword("") }}>
        Annuler
      </Button>
    </div>
  )
}
