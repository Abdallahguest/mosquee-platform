"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { createMosque, updateMosqueAdmin } from "@/lib/actions/superadmin.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MosqueAdminFormProps {
  mosque?: {
    id: number; slug: string; name: string; city: string; country: string
    nameFr?: string | null
    nameEn?: string | null
    nameAr?: string | null
    commune?: string | null
    quartier?: string | null
    secteur?: string | null
    latitude: number; longitude: number; timezone: string
    isVerified: boolean
    donationUrl?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
    orangeMoneyNumber?: string | null
  }
}

export default function MosqueAdminForm({ mosque }: MosqueAdminFormProps) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const isEdit = !!mosque

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = isEdit
      ? await updateMosqueAdmin(mosque.id, formData)
      : await createMosque(formData)

    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    router.push("/super-admin")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="space-y-1.5">
        <Label htmlFor="name">Nom de la mosquée</Label>
        <Input id="name" name="name" required defaultValue={mosque?.name} />
      </div>

      {/* Noms officiels multilingues (optionnels). Vide = nom par défaut ci-dessus. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nameFr">Nom en français (optionnel)</Label>
          <Input id="nameFr" name="nameFr" defaultValue={mosque?.nameFr ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nameEn">Nom en anglais (optionnel)</Label>
          <Input id="nameEn" name="nameEn" defaultValue={mosque?.nameEn ?? ""} dir="ltr" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nameAr">Nom en arabe (optionnel)</Label>
          <Input id="nameAr" name="nameAr" defaultValue={mosque?.nameAr ?? ""} dir="rtl" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug URL (ex: masdjid-taqwa)</Label>
        <Input id="slug" name="slug" required defaultValue={mosque?.slug} placeholder="minuscules-avec-tirets" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" name="city" required defaultValue={mosque?.city} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Pays</Label>
          <Input id="country" name="country" required defaultValue={mosque?.country ?? "Guinée"} />
        </div>
      </div>

      {/* Coordonnées précises (optionnelles, champs libres) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="commune">Commune (optionnel)</Label>
          <Input id="commune" name="commune" defaultValue={mosque?.commune ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quartier">Quartier (optionnel)</Label>
          <Input id="quartier" name="quartier" defaultValue={mosque?.quartier ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="secteur">Secteur (optionnel)</Label>
          <Input id="secteur" name="secteur" defaultValue={mosque?.secteur ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" name="latitude" type="number" step="any" required defaultValue={mosque?.latitude} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" name="longitude" type="number" step="any" required defaultValue={mosque?.longitude} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="timezone">Fuseau horaire</Label>
        <Input id="timezone" name="timezone" required defaultValue={mosque?.timezone ?? "Africa/Conakry"} />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isVerified"
          name="isVerified"
          type="checkbox"
          value="true"
          defaultChecked={mosque?.isVerified}
          className="rounded"
        />
        <Label htmlFor="isVerified">Mosquée vérifiée</Label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contactEmail">Email de contact public (optionnel)</Label>
        <Input id="contactEmail" name="contactEmail" type="email" defaultValue={mosque?.contactEmail ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contactPhone">Téléphone de contact (optionnel)</Label>
        <Input id="contactPhone" name="contactPhone" defaultValue={mosque?.contactPhone ?? ""} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="orangeMoneyNumber">Numéro Orange Money pour les dons (optionnel)</Label>
        <Input
          id="orangeMoneyNumber"
          name="orangeMoneyNumber"
          type="tel"
          defaultValue={mosque?.orangeMoneyNumber ?? ""}
          placeholder="620000000"
          dir="ltr"
        />
        <p className="text-xs text-muted-foreground">
          9 chiffres commençant par 6. Affiché en clair sur la page publique — la plateforme ne traite aucun paiement.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="donationUrl">Lien de don externe (optionnel)</Label>
        <Input id="donationUrl" name="donationUrl" type="url" defaultValue={mosque?.donationUrl ?? ""} placeholder="https://..." />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800">
        {loading ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer la mosquée"}
      </Button>
    </form>
  )
}
