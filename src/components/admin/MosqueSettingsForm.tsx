"use client"

import { useState } from "react"
import { updateMosqueSettings } from "@/lib/actions/mosque.actions"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Mosque {
  id: number
  slug: string
  name: string
  city: string
  country: string
  latitude: number
  longitude: number
  timezone: string
  calculationMethod: string
  iqamaFajr: number
  iqamaDhuhr: number
  iqamaAsr: number
  iqamaMaghrib: number
  iqamaIsha: number
}

const METHODS = [
  { value: "MWL",       label: "Muslim World League" },
  { value: "ISNA",      label: "Islamic Society of North America" },
  { value: "Egyptian",  label: "Egyptian General Authority" },
  { value: "UmmAlQura", label: "Umm Al-Qura (Mecque)" },
  { value: "Karachi",   label: "University of Islamic Sciences, Karachi" },
]

export default function MosqueSettingsForm({ mosque }: { mosque: Mosque }) {
  const [error, setError]     = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [method, setMethod]   = useState(mosque.calculationMethod)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("slug", mosque.slug)
    formData.set("calculationMethod", method)

    const result = await updateMosqueSettings(mosque.id, formData)

    if (!result.success) {
      setError(result.error)
    } else {
      setSuccess("Paramètres sauvegardés !")
      setTimeout(() => setSuccess(""), 3000)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Identité */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identité</CardTitle>
          <CardDescription>Informations publiques de la mosquée</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom <span className="text-destructive">*</span></Label>
            <Input id="name" name="name" required defaultValue={mosque.name} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city">Ville <span className="text-destructive">*</span></Label>
              <Input id="city" name="city" required defaultValue={mosque.city} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Pays <span className="text-destructive">*</span></Label>
              <Input id="country" name="country" required defaultValue={mosque.country} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Géolocalisation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Géolocalisation</CardTitle>
          <CardDescription>
            Utilisée pour le calcul précis des horaires.{" "}
            <a
              href="https://www.latlong.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline"
            >
              Trouver mes coordonnées →
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="latitude">Latitude <span className="text-destructive">*</span></Label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="0.0001"
                required
                defaultValue={mosque.latitude}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="longitude">Longitude <span className="text-destructive">*</span></Label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="0.0001"
                required
                defaultValue={mosque.longitude}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horaires */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Calcul des horaires</CardTitle>
          <CardDescription>Choisissez la méthode reconnue dans votre région</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Méthode de calcul <span className="text-destructive">*</span></Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="timezone">Fuseau horaire <span className="text-destructive">*</span></Label>
            <Input
              id="timezone"
              name="timezone"
              required
              defaultValue={mosque.timezone}
              placeholder="Africa/Conakry"
            />
            <p className="text-xs text-muted-foreground">
              Exemples : Africa/Conakry, Europe/Paris, Asia/Riyadh
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ajustements iqama */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ajustements iqama</CardTitle>
          <CardDescription>
            Délai en minutes entre l&apos;adhan et l&apos;iqama, pour chaque prière
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="iqamaFajr">Fajr (min)</Label>
              <Input
                id="iqamaFajr"
                name="iqamaFajr"
                type="number"
                min={0}
                max={60}
                required
                defaultValue={mosque.iqamaFajr}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="iqamaDhuhr">Dhuhr (min)</Label>
              <Input
                id="iqamaDhuhr"
                name="iqamaDhuhr"
                type="number"
                min={0}
                max={60}
                required
                defaultValue={mosque.iqamaDhuhr}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="iqamaAsr">Asr (min)</Label>
              <Input
                id="iqamaAsr"
                name="iqamaAsr"
                type="number"
                min={0}
                max={60}
                required
                defaultValue={mosque.iqamaAsr}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="iqamaMaghrib">Maghrib (min)</Label>
              <Input
                id="iqamaMaghrib"
                name="iqamaMaghrib"
                type="number"
                min={0}
                max={60}
                required
                defaultValue={mosque.iqamaMaghrib}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="iqamaIsha">Isha (min)</Label>
              <Input
                id="iqamaIsha"
                name="iqamaIsha"
                type="number"
                min={0}
                max={60}
                required
                defaultValue={mosque.iqamaIsha}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-green-700 hover:bg-green-800"
        size="lg"
      >
        {loading ? "Sauvegarde..." : "Sauvegarder les paramètres"}
      </Button>

    </form>
  )
}
