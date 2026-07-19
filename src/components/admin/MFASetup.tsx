"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { setupTOTP, confirmTOTP, disableTOTP } from "@/lib/actions/mfa.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QRCodeSVG } from "qrcode.react"

interface MFASetupProps {
  isEnabled: boolean
  onToggle: () => void
}

export function MFASetup({ isEnabled, onToggle }: MFASetupProps) {
  const t = useTranslations("mfa")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Setup state
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeUrl: string; recoveryCodes: string[] } | null>(null)
  const [verificationCode, setVerificationCode] = useState("")

  async function handleSetup() {
    setIsLoading(true)
    setError(null)

    const result = await setupTOTP()

    if (result.success) {
      setSetupData(result.data)
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  async function handleConfirm() {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Le code doit comporter 6 chiffres")
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("token", verificationCode)

    const result = await confirmTOTP(formData)

    if (result.success) {
      setSuccess(true)
      setSetupData(null)
      setTimeout(() => {
        onToggle()
        setSuccess(false)
      }, 2000)
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  async function handleDisable() {
    if (!confirm("Êtes-vous sûr de vouloir désactiver MFA ? Cela réduira la sécurité de votre compte.")) {
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await disableTOTP()

    if (result.success) {
      onToggle()
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  if (success) {
    return (
      <Alert className="border-green-200 bg-green-50 text-green-800">
        <AlertDescription>
          MFA activé avec succès ! Vos codes de récupération ont été sauvegardés.
        </AlertDescription>
      </Alert>
    )
  }

  if (setupData) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Étape 1 : Scannez le QR code</h3>
          <p className="text-sm text-blue-700 mb-4">
            Utilisez Google Authenticator, Authy ou une application compatible sur votre téléphone.
          </p>
          <div className="flex justify-center bg-white p-4 rounded-lg">
            <QRCodeSVG value={setupData.qrCodeUrl} size={200} />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-medium text-amber-900 mb-2">Étape 2 : Entrez le code de vérification</h3>
          <p className="text-sm text-amber-700 mb-4">
            Entrez le code à 6 chiffres affiché par votre application.
          </p>
          <div className="space-y-2">
            <Label htmlFor="verificationCode">Code de vérification</Label>
            <Input
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-900 mb-2">Étape 3 : Sauvegardez vos codes de récupération</h3>
          <p className="text-sm text-red-700 mb-2">
            Ces codes vous permettront de récupérer votre compte si vous perdez votre téléphone.
            Sauvegardez-les dans un endroit sûr.
          </p>
          <div className="bg-white p-3 rounded font-mono text-sm space-y-1">
            {setupData.recoveryCodes.map((code, index) => (
              <div key={index}>{code}</div>
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || verificationCode.length !== 6}
            className="flex-1"
          >
            {isLoading ? "Vérification..." : "Activer MFA"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setSetupData(null)}
            disabled={isLoading}
          >
            Annuler
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isEnabled ? (
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <AlertDescription>
              MFA est actuellement activé sur votre compte.
            </AlertDescription>
          </Alert>
          <Button
            variant="destructive"
            onClick={handleDisable}
            disabled={isLoading}
          >
            {isLoading ? "Désactivation..." : "Désactiver MFA"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50 text-blue-800">
            <AlertDescription>
              MFA n'est pas activé. Nous vous recommandons fortement de l'activer pour sécuriser votre compte super-admin.
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleSetup}
            disabled={isLoading}
            className="bg-green-700 hover:bg-green-800"
          >
            {isLoading ? "Configuration..." : "Activer MFA"}
          </Button>
        </div>
      )}
    </div>
  )
}
