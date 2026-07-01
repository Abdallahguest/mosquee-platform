# Contribuer à Amana Connect

Merci de l'intérêt porté au projet. Ce document explique comment contribuer
de façon efficace et alignée avec les principes du projet.

---

## Principes non négociables

Toute contribution est évaluée contre ces cinq critères (voir `DECISIONS.md`) :

- **Anti-riba** : aucun frais d'intérêt, aucune dette
- **Anti-gharar** : pas d'incertitude trompeuse — les données affichées sont
  celles réellement appliquées, jamais des valeurs calculées présentées comme
  certaines
- **Anti-ghich** : pas de dark patterns, pas de tracking publicitaire
- **Anti-jahàla** : l'utilisateur comprend ce qui se passe
- **Anti-israf** : ne pas construire une usine pour un besoin simple

**Règle absolue : aucune photo de personne dans l'interface, jamais.**

---

## Workflow de développement

```bash
# 1. Cloner et installer
git clone https://github.com/Abdallahguest/mosquee-platform.git
cd mosquee-platform
pnpm install

# 2. Configurer l'environnement
cp .env.example .env.local
# Remplir DATABASE_URL, BETTER_AUTH_SECRET, etc.

# 3. Pousser le schéma (environnement local uniquement)
pnpm db:push
pnpm db:seed   # ⚠️ jamais contre la production

# 4. Développer
pnpm dev       # Turbopack (dev uniquement)

# 5. Vérifier avant de commiter
pnpm exec tsc --noEmit   # TypeScript strict
pnpm test:run            # 127 tests Vitest
```

---

## Contrainte de build importante

```bash
# Build de production — TOUJOURS avec --webpack
pnpm build   # = next build --webpack
```

`next build` sans `--webpack` active Turbopack par défaut, incompatible avec
Serwist (le service worker n'est pas généré). Voir `DECISIONS.md` D-005.

---

## Standards de code

- **TypeScript strict** — pas d'`any` implicite
- **Zod** — validation systématique côté serveur sur toutes les Server Actions
- **Codes d'erreur normalisés** — constantes en MAJUSCULES dans `action-result.ts`
- **i18n** — tous les textes via `useTranslations` / `getTranslations`, jamais codés en dur
- **Pas de style inline** sauf pages autonomes hors `[locale]` (`offline`, `not-found`)

---

## Architecture

Voir `ARCHITECTURE.md` pour la structure complète.

Points clés :
- **Server Components par défaut** — Client Components uniquement si interactivité nécessaire
- **Server Actions** pour toutes les mutations — pas d'API REST séparée
- **Isolation multi-tenant** — chaque mutation vérifie `mosqueId` côté serveur
- **`authorization.ts`** — logique d'autorisation pure, toujours couverte par des tests

---

## Tests

```bash
pnpm test:run       # Une fois
pnpm test           # Mode watch
pnpm test:coverage  # Avec couverture
```

Chaque nouvelle logique métier doit être couverte par des tests. Suivre le
pattern existant dans `src/test/` (mock Drizzle) ou `src/lib/__tests__/`
(modules purs).

---

## Signaler une vulnérabilité

Ne pas ouvrir d'issue publique. Contacter directement :
**abdallahmarly90@gmail.com**

Voir `SECURITY.md` pour les détails.

---

## Contact

**Abdoulaye Bah** — abdallahmarly90@gmail.com
