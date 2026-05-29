import { requireSuperAdmin } from "@/lib/auth-helpers"
import { getAllUsers } from "@/db/queries"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function UsersPage() {
  await requireSuperAdmin()
  const users = await getAllUsers()

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Comptes ({users.length})</h1>
        <Link href="/super-admin"><Button variant="outline">← Mosquées</Button></Link>
      </div>
      <div className="space-y-2">
        {users.map((u) => (
          <Card key={u.id}>
            <CardContent className="py-3 flex items-center justify-between">
              <div>
                <span className="font-medium">{u.name}</span>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {u.role === "super_admin" && <Badge className="bg-purple-600">super-admin</Badge>}
                {u.emailVerified
                  ? <Badge variant="secondary">✓ vérifié</Badge>
                  : <Badge variant="outline">non vérifié</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
