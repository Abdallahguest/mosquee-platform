"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { createUserAccount } from "@/lib/actions/superadmin.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateUserForm() {
  const router = useRouter()
  const [error, setError]     = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createUserAccount(formData)

    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    setSuccess(`Compte créé pour ${result.data.email}. Communiquez-lui ses identifiants.`)
    e.currentTarget.reset()
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Nom de l&apos;admin</Label>
        <Input id="name" name="name" required placeholder="Ex: Mamadou Diallo" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="admin@mosquee.com" />
        <p className="text-xs text-gray-400">
          Doit correspondre à l&apos;email admin de la mosquée que vous lui associez.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Mot de passe temporaire</Label>
        <Input id="password" name="password" type="text" required placeholder="Min. 8 caractères" />
        <p className="text-xs text-gray-400">
          Communiquez ce mot de passe à l&apos;admin. Il pourra le changer ensuite.
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800">
        {loading ? "Création..." : "Créer le compte (vérifié)"}
      </Button>
    </form>
  )
}
