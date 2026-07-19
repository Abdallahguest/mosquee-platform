"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { updateEmergencyEmail } from "@/lib/actions/mfa.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EmergencyEmailSetupProps {
  currentEmail: string | null
}

export function EmergencyEmailSetup({ currentEmail }: EmergencyEmailSetupProps) {
  const t = useTranslations("mfa")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState(currentEmail || "")

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const result = await updateEmergencyEmail(formData)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>
            Email d'urgence mis à jour avec succès.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert className="border-amber-200 bg-amber-50 text-amber-800">
        <AlertDescription>
          Cet email sera utilisé pour envoyer un lien de récupération en cas de perte d'accès à votre compte.
          Utilisez une adresse email différente de votre compte principal.
        </AlertDescription>
      </Alert>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="emergencyEmail">Email d'urgence</Label>
          <Input
            id="emergencyEmail"
            name="emergencyEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="emergency@example.com"
            disabled={isLoading}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Mise à jour..." : "Mettre à jour"}
        </Button>
      </form>
    </div>
  )
}
