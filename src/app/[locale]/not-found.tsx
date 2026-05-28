import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🕌</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page introuvable</h1>
        <p className="text-gray-500 mb-8">
          Cette mosquée n&apos;existe pas dans notre base de données.
        </p>
        <Link
          href="/"
          className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
