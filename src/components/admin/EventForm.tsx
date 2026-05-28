"use client"

import { useState, useRef } from "react"
import { createEvent } from "@/lib/actions/event.actions"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label }    from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EventForm({ mosqueId }: { mosqueId: number }) {
  const [error, setError]     = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("mosqueId", String(mosqueId))

    const result = await createEvent(formData)

    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess("Événement créé !")
    formRef.current?.reset()
    setLoading(false)
    setTimeout(() => setSuccess(""), 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nouvel événement</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">

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

          <div className="space-y-1.5">
            <Label htmlFor="title">Titre <span className="text-destructive">*</span></Label>
            <Input id="title" name="title" required maxLength={100} placeholder="Titre de l'événement" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              maxLength={1000}
              className="resize-none"
              placeholder="Description optionnelle..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Lieu <span className="text-destructive">*</span></Label>
            <Input
              id="location"
              name="location"
              required
              defaultValue="À la mosquée"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startAt">Début <span className="text-destructive">*</span></Label>
              <Input id="startAt" name="startAt" type="datetime-local" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endAt">Fin</Label>
              <Input id="endAt" name="endAt" type="datetime-local" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublished"
              id="eventPublished"
              value="true"
              className="w-4 h-4 accent-green-600"
            />
            <Label htmlFor="eventPublished" className="font-normal cursor-pointer">
              Publier immédiatement
            </Label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-green-700 hover:bg-green-800"
          >
            {loading ? "Création..." : "Créer l'événement"}
          </Button>

        </form>
      </CardContent>
    </Card>
  )
}
