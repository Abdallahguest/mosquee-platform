/**
 * Logique d'autorisation pure et centralisée.
 *
 * Ces fonctions ne dépendent NI de la base de données NI de la session.
 * Elles reçoivent les données nécessaires en paramètres et retournent une décision.
 * Cela les rend entièrement testables et fait de la sécurité une logique
 * explicite et vérifiable, plutôt qu'implicite dans chaque requête.
 *
 * Principe (anti-ghich / anti-jahàla) : l'autorisation est lisible, nommée,
 * et ne laisse aucune ambiguïté sur qui peut faire quoi.
 */

export type UserRole = "member" | "admin" | "super_admin"

export interface AuthUser {
  id: string
  role: UserRole | string
}

/**
 * Un super-admin a tous les droits sur la plateforme.
 */
export function isSuperAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === "super_admin"
}

/**
 * Un utilisateur peut-il gérer (modifier/supprimer) une mosquée donnée ?
 *
 * @param user            L'utilisateur connecté (ou null si non connecté)
 * @param targetMosqueId  L'ID de la mosquée qu'il veut gérer
 * @param userMosqueIds   Les IDs des mosquées auxquelles l'utilisateur est lié (via mosque_admins)
 *
 * Règles :
 *  - non connecté → refusé
 *  - super-admin → autorisé (tous droits)
 *  - admin lié à cette mosquée → autorisé
 *  - sinon → refusé
 */
export function canManageMosque(
  user: AuthUser | null | undefined,
  targetMosqueId: number | null | undefined,
  userMosqueIds: number[]
): boolean {
  if (!user) return false
  if (targetMosqueId == null) return false
  if (isSuperAdmin(user)) return true
  return userMosqueIds.includes(targetMosqueId)
}

/**
 * Un utilisateur peut-il gérer une ressource (annonce, événement) ?
 *
 * @param user             L'utilisateur connecté
 * @param resourceMosqueId La mosquée à laquelle appartient la ressource
 * @param userMosqueIds    Les mosquées de l'utilisateur
 *
 * Même logique que canManageMosque : on vérifie que la ressource
 * appartient à une mosquée que l'utilisateur administre.
 */
export function canManageResource(
  user: AuthUser | null | undefined,
  resourceMosqueId: number | null | undefined,
  userMosqueIds: number[]
): boolean {
  return canManageMosque(user, resourceMosqueId, userMosqueIds)
}

/**
 * Un super-admin peut-il agir sur un compte cible ?
 *
 * Règle de protection : un super-admin ne peut PAS agir sur un AUTRE super-admin
 * (empêche la prise de contrôle entre super-admins). Il peut agir sur lui-même
 * et sur les comptes non super-admin.
 *
 * @param actor   Le super-admin qui agit
 * @param target  Le compte cible
 */
export function canSuperAdminActOnUser(
  actor: AuthUser | null | undefined,
  target: AuthUser | null | undefined
): boolean {
  if (!isSuperAdmin(actor)) return false
  if (!target) return false
  // On peut toujours agir sur soi-même
  if (actor!.id === target.id) return true
  // On ne peut pas agir sur un autre super-admin
  if (isSuperAdmin(target)) return false
  return true
}
