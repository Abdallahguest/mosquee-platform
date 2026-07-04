import { reactivateSubscription } from "@/lib/actions/subscription.actions"

// Bouton de réactivation d'abonnement — Server Component avec form action.
// Extraction nécessaire car Next.js 16 interdit les Server Actions inline
// dans les pages Server Component sans directive "use server" au niveau fichier.
export default function ReactivateButton({ mosqueId }: { mosqueId: number }) {
  async function handleReactivate() {
    "use server"
    await reactivateSubscription(mosqueId)
  }

  return (
    <form action={handleReactivate}>
      <button
        type="submit"
        className="text-xs text-green-700 hover:underline"
      >
        Réactiver
      </button>
    </form>
  )
}
