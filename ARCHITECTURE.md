# Architecture — Amana Connect

## Vue d'ensemble

Amana Connect est un SaaS multi-tenant de gestion de mosquées. Chaque mosquée
est un tenant isolé : ses données ne sont jamais accessibles par un autre admin.

```
┌─────────────────────────────────────────────────┐
│                  Vercel (Edge)                  │
│  ┌──────────────────────────────────────────┐   │
│  │           Next.js 16 App Router          │   │
│  │                                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌────────┐ │   │
│  │  │  Public  │  │  Admin   │  │ Super  │ │   │
│  │  │ /m/[slug]│  │ /admin   │  │ admin  │ │   │
│  │  └────┬─────┘  └────┬─────┘  └───┬────┘ │   │
│  │       │             │            │      │   │
│  │  ┌────▼─────────────▼────────────▼────┐ │   │
│  │  │         Server Actions             │ │   │
│  │  │  (mutations — pas d'API REST)      │ │   │
│  │  └────────────────┬───────────────────┘ │   │
│  │                   │                     │   │
│  │  ┌────────────────▼───────────────────┐ │   │
│  │  │    Drizzle ORM + Neon (PostgreSQL) │ │   │
│  │  └────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Structure des sources

```
src/
├── app/                    # Routes Next.js (App Router)
│   ├── [locale]/           # Toutes les routes i18n (fr/en/ar)
│   │   ├── m/[slug]/       # Pages publiques mosquée
│   │   ├── admin/          # Panel admin (vert)
│   │   └── super-admin/    # Panel super-admin (indigo)
│   ├── api/auth/           # Handler Better-Auth
│   └── offline/            # Page repli hors-ligne (autonome)
│
├── components/
│   ├── public/             # Composants page publique
│   ├── admin/              # Composants panel admin
│   ├── superadmin/         # Composants super-admin
│   └── ui/                 # Composants génériques (shadcn/ui)
│
├── db/
│   ├── schema.ts           # Schéma Drizzle — source de vérité
│   ├── queries.ts          # Toutes les requêtes SELECT
│   └── index.ts            # Connexion Neon
│
├── lib/
│   ├── auth.ts             # Config Better-Auth (serveur)
│   ├── auth-client.ts      # Client Better-Auth (navigateur)
│   ├── auth-helpers.ts     # requireSession, getSessionMosque, requireSuperAdmin
│   ├── authorization.ts    # Logique d'autorisation pure (testable sans DB)
│   ├── actions/            # Server Actions (mutations)
│   └── ...                 # Utilitaires métier
│
├── i18n/                   # Config next-intl (routing, navigation)
├── messages/               # Traductions fr/en/ar (~350 clés)
├── test/                   # Suite Vitest (115 tests)
└── proxy.ts                # Middleware (auth guard + i18n)
```

## Isolation multi-tenant

L'isolation repose sur trois couches :

1. **Couche requête** — toutes les queries filtrent par `mosqueId` issu de la
   session courante (`getSessionMosque()`). Jamais de `mosqueId` passé par le
   client.

2. **Couche autorisation** — `authorization.ts` contient des fonctions pures
   (`canManageMosque`, `canManageResource`) qui vérifient que le `mosqueId` de
   la ressource appartient bien aux mosquées de l'utilisateur.

3. **Couche test** — `authorization.test.ts` prouve l'absence d'accès
   inter-mosquées par des tests unitaires marqués CRITIQUE.

## Flux d'une mutation (exemple : publier une annonce)

```
1. Admin clique "Publier"
2. Client → Server Action toggleAnnouncementPublished(id, current)
3. Server Action → getSessionMosque() → vérifie session + récupère mosqueId
4. UPDATE announcements WHERE id = ? AND mosque_id = ?  ← double contrainte
5. revalidatePath() → Next.js invalide le cache de la page publique
6. Client reçoit { success: true }
```

## Authentification

- **Better-Auth** avec adaptateur Drizzle (PostgreSQL)
- Email + mot de passe uniquement (`disableSignUp: true` — inscription fermée)
- Comptes créés uniquement par le super-admin (Modèle B)
- Sessions 7 jours, cookie cache 5 min
- Rate limiting en base : 5 tentatives/min sur sign-in

## Rôles

| Rôle | Couleur | Accès |
|---|---|---|
| `super_admin` | Indigo | Toute la plateforme |
| `admin` | Vert | Sa mosquée uniquement |

## PWA / Hors-ligne

- Service Worker via Serwist (NetworkFirst sur les navigations)
- Cache de données en localStorage (snapshots par mosquée)
- Build obligatoire en `next build --webpack` (Turbopack incompatible Serwist)
- Révision precache à incrémenter à chaque modif de `app/offline/page.tsx`

## Observabilité

- **Sentry** : capture des erreurs serveur et client
- **Vercel Analytics** : pages vues et performances
- **GitHub Actions CI** : `tsc --noEmit` + `vitest run` sur chaque push

## Internationalisation

- next-intl, 3 locales : `fr` (défaut), `en`, `ar` (RTL)
- `localePrefix: "as-needed"` — pas de `/fr` dans les URLs
- Polices : Geist (latin) + Noto Sans Arabic (arabe)
