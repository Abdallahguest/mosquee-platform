import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NoMosque() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Alert>
        <AlertDescription>
          <p className="font-medium mb-1">Aucune mosquée associée à votre compte</p>
          <p className="text-sm">
            Votre compte n&apos;est rattaché à aucune mosquée. Contactez un
            administrateur, ou exécutez le seed pour les données de test.
          </p>
          <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
            pnpm db:seed
          </code>
        </AlertDescription>
      </Alert>
    </div>
  )
}
