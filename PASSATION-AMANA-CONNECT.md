# Amana Connect — Document de passation complet

> Document de référence pour reprendre le projet dans une nouvelle conversation sans rien perdre.
> **Dernière mise à jour : 19 juillet 2026** — audit du working tree réel. Base fusionnée : commit `53e8e53`.
> Tous les faits techniques de ce document ont été vérifiés directement dans le code, pas de mémoire.

> ⚠️ **AVERTISSEMENT DE DIVERGENCE (19 juillet 2026).**
> Le working tree contient un **gros chantier de sécurité NON COMMITÉ et NON FUSIONNÉ** (inscription self-service, MFA TOTP, récupération d'urgence, rôles support/billing, alertes, tests E2E Playwright). `git log` s'arrête à `53e8e53` ; tout ce chantier n'existe que dans les fichiers locaux modifiés/non suivis.
> **Statut vérifié : ~90 % de ce chantier est du code mort (0 importateur), et la seule partie réellement branchée — l'inscription self-service — est cassée et constitue une régression doctrinale.** Détail complet en **§9bis**. Ne pas croire les sections §8/§9 « stables » sans lire §9bis d'abord.

---

## 0. Comment utiliser ce document

Ce document contient **tout** le contexte du projet : qui je suis, ce que je construis, selon quelles règles, où en est le code, ce qui a été décidé, et ce qui reste à faire. Dans une nouvelle conversation, colle ce document en premier.

**Ce que j'attends de l'assistant** (voir §14 pour le détail) : français, exhaustif, franc, critique non filtrée, décisions tranchées, vérification au compilateur avant toute livraison, et rappel systématique que le terrain prime sur le code.

---

## 1. Qui je suis

**Abdoulaye Bah** (alias Abdallah), étudiant en **Licence 3 Génie Logiciel** à l'**Université Nongo Conakry (UNC)**, en Guinée. Je construis seul une plateforme SaaS, avec l'objectif de lancer une vraie entreprise logicielle **100% halal**, sans capital de départ.

**Contacts / liens :**
- E-mail : abdallahmarly90@gmail.com
- Téléphone : +224 626 736 219 / 669 55 36 00
- GitHub : github.com/Abdallahguest (repo : `mosquee-platform`)
- LinkedIn : linkedin.com/in/abdoulaye-bah-9405872b7
- Production : **amanaconnect.org** (domaine primaire, redirect 307 depuis mosquee-platform.vercel.app)
- Super-admin de test : abdallahmarly90@gmail.com

**Contexte personnel :**
- Je travaille **surtout sur mobile**, je teste visuellement depuis mon téléphone sur Vercel.
- L'assistant ne voit pas mon écran : **la validation visuelle, c'est moi**.
- J'ai le **GitHub Student Developer Pack** actif jusqu'au 23 mai 2028 (Copilot Student, 200 crédits IA/mois, JetBrains, Notion, DigitalOcean 200$, Azure 100$).
- Je postule en parallèle à des postes de développeur (ex : Mansa Talents, startup RH guinéenne). **Cette tension stage/startup n'est pas encore tranchée.**

---

## 2. Le projet : Amana Connect

Plateforme **SaaS multi-tenant de gestion de mosquées**. Chaque mosquée a :
- une **page publique** : horaires de prière, annonces, événements, membres, dons Orange Money ;
- un **espace admin** : gestion du contenu de sa mosquée ;
- au-dessus, un **super-admin** qui crée les mosquées et les comptes.

**Le succès se mesure** à un déploiement réel validé par des utilisateurs de terrain, **pas à des lignes de code**.

---

## 3. Cadre doctrinal NON-NÉGOCIABLE

Toute décision (technique, UX, business) est filtrée par ces principes du fiqh al-muamalat :

- **Riba** (intérêt) — interdit. Aucun frais d'intérêt, aucune dette, aucune pénalité de retard.
- **Gharar** (incertitude trompeuse) — interdit. Ex : ne jamais afficher des horaires périmés comme certains ; toujours dater une donnée en cache ; bandeau d'avertissement si l'abonnement a expiré.
- **Ghich** (tromperie) — interdit. Ex : ne pas lister sur le CV des technos sans projet réel ; ne pas annoncer une fonctionnalité qui n'existe pas ; **ne pas écrire un titre de commit qui ne correspond pas au contenu**.
- **Jahàla** (ignorance imposée) — interdit. L'utilisateur doit comprendre ce qui se passe (messages explicatifs, transparence, décompte avant suppression).
- **Israf** (gaspillage / sur-ingénierie) — vigilance active. Ne pas construire une usine pour un besoin simple.

**Règles absolues supplémentaires :**
- **AUCUNE photo de personne dans l'interface, jamais.** (D-011)
- **Aucune commission sur les dons ou la zakat.** Jamais.
- **Ne JAMAIS exécuter le seed (`pnpm db:seed`) contre la production.**

---

## 4. Stack technique (versions exactes, vérifiées)

| Domaine | Technologie | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.6 |
| Langage | TypeScript strict | ^5 |
| UI | React | 19.2.4 |
| Styles | Tailwind CSS | ^4 |
| Composants | shadcn/ui, radix-ui, lucide-react | ^4.8.0 / ^1.4.3 / ^1.16.0 |
| BDD | PostgreSQL via Neon | @neondatabase/serverless ^1.1.0 |
| ORM | Drizzle ORM | ^0.45.2 |
| Migrations | drizzle-kit | ^0.31.10 |
| Auth | Better-Auth | ^1.6.11 |
| i18n | next-intl (FR/EN/AR + RTL) | ^4.12.0 |
| PWA | Serwist + @serwist/next | ^9.5.11 |
| E-mail | Resend | ^6.12.4 |
| Stockage audio | Cloudflare R2 (via @aws-sdk/client-s3) | ^3.1079.0 |
| Validation | Zod | ^4.4.3 |
| Tests | Vitest + @vitest/coverage-v8 | ^4.1.7 |
| Monitoring | Sentry | ^10.62.0 |
| Analytics | Vercel Analytics | ^2.0.1 |
| Sanitization | isomorphic-dompurify | ^3.14.0 |
| Markdown | react-markdown + remark-gfm | ^10.1.0 / ^4.0.1 |
| Horaires (suggestion) | adhan | ^4.4.3 |
| Gestionnaire de paquets | pnpm | 10.0.0 |
| Hooks git | husky + lint-staged | ^9.1.7 / ^17.0.5 |
| Licence | UNLICENSED (propriétaire) | — |

**Scripts npm :**
```
dev            next dev --turbopack
build          next build --webpack     ← --webpack OBLIGATOIRE (Turbopack incompatible serwist)
db:push        drizzle-kit push
db:studio      drizzle-kit studio
db:seed        tsx src/db/seed.ts       ← JAMAIS en production
start          next start
lint           eslint
test           vitest
test:run       vitest run
test:coverage  vitest run --coverage
```

---

## 5. Variables d'environnement (17 au total)

**Base de données**
- `DATABASE_URL` — Neon PostgreSQL

**Auth**
- `BETTER_AUTH_URL` = `https://amanaconnect.org`
- `NEXT_PUBLIC_APP_URL` = `https://amanaconnect.org`

**E-mail (Resend)**
- `RESEND_API_KEY`
- `EMAIL_FROM` (repli : `noreply@mail.amanaconnect.org`)
- `EMAIL_FROM_NAME` (repli : `Amana Connect`)

**Cloudflare R2 (audio)** — ⚠️ **non documentées ailleurs dans le repo, à ajouter dans ARCHITECTURE.md**
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

**Sentry**
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

**Système** (fournies par Next.js/Vercel)
- `NODE_ENV`, `NEXT_RUNTIME`

---

## 6. Contraintes opérationnelles (Guinée)

- **Réseau instable** (Conakry → serveurs européens) : connexions fréquemment coupées. Le réseau existe mais est cher (données mobiles) et capricieux.
- **Build local impossible** : Turbopack échoue sous Windows (erreur os 1450 — ressources, pas un bug de code).
- **Workflow obligatoire** : coder en local → `pnpm exec tsc --noEmit` → `pnpm vitest run` → commit → push → **tester en PRODUCTION** sur Vercel.
- **Toutes les opérations BDD directes** se font via l'éditeur SQL de **Neon** (contourne l'instabilité réseau locale).
- **PWA tenace** : pour tester une nouvelle version du SW, désinstaller/réinstaller la PWA + effacer les données du site.
- **Brave Shields** bloque parfois les dashboards (Cloudflare, Vercel) — désactiver pour ces sites si un bouton ne répond pas.

---

## 7. Architecture

### 7.1 Base de données — 12 tables

| Table | Rôle |
|---|---|
| `mosques` | Mosquées (multi-tenant), inclut abonnements + Orange Money |
| `users` | Comptes (Better-Auth) |
| `account` | Mots de passe hashés (Better-Auth, providerId `credential`) |
| `session` | Sessions actives |
| `verification` | Tokens de vérification email |
| `mosqueAdmins` | Table de jonction admin ↔ mosquée (CASCADE) |
| `mosqueMembers` | Imams, sages, conseillers, équipe (CASCADE) |
| `announcements` | Annonces (CASCADE sur mosque_id, NO ACTION sur author_id) |
| `events` | Événements (CASCADE sur mosque_id) |
| `auditLog` | Journal d'activité (15 types d'actions) |
| `payments` | Historique des paiements (montant GNF, méthode, période) |
| `rateLimit` | Limitation de débit (Better-Auth) |

**Contraintes FK vérifiées :**
- `announcements.mosque_id` → CASCADE
- `announcements.author_id` → NO ACTION (volontaire : ne pas supprimer les annonces si un compte est effacé)
- `events.mosque_id` → CASCADE
- `mosque_admins.mosque_id` / `.user_id` → CASCADE
- `mosque_members.mosque_id` → CASCADE

**Index :** `announcements_mosque_id_idx`, `announcements_is_published_idx`, `announcements_published_at_idx`, `events_mosque_id_idx`, `events_is_published_idx`, `events_start_at_idx`, + index sur `payments.mosque_id`.

**Migrations versionnées :**
- `drizzle/0000_initial_schema.sql`
- `drizzle/0001_subscription_fields.sql` (trial_ends_at, paid_until, subscription_status)
- `drizzle/0002_payments_table.sql`

### 7.2 Séparation des rôles (codes couleur stricts)

- **Super-admin** (indigo) : crée mosquées et comptes, gère les abonnements.
- **Admin** (vert) : gère uniquement le contenu de SA mosquée.
- **Espace public** (vert distinct).

### 7.3 Routes (32 pages)

**Public** : `/`, `/m/[slug]`, `/m/[slug]/announcements`, `/m/[slug]/announcements/[id]`, `/m/[slug]/events`, `/m/[slug]/events/[id]`, `/privacy`, `/offline`

**Auth** : `/login`, `/register` (désactivée, redirige), `/forgot-password`, `/reset-password`

**Admin** : `/admin`, `/admin/activity`, `/admin/announcements`, `/admin/announcements/[id]/edit`, `/admin/events`, `/admin/events/[id]/edit`, `/admin/members`, `/admin/profile`, `/admin/select-mosque`, `/admin/settings`, `/admin/subscription-expired`

**Super-admin** : `/super-admin`, `/super-admin/activity`, `/super-admin/health`, `/super-admin/mosques`, `/super-admin/mosques/new`, `/super-admin/mosques/[id]/edit`, `/super-admin/mosques/[id]/admins`, `/super-admin/subscriptions`, `/super-admin/users`

### 7.4 Points d'architecture critiques

- `src/app/layout.tsx` (racine) fait juste `return children` — **il ne rend PAS `<html>`/`<body>`**. Ces balises sont dans `src/app/[locale]/layout.tsx`. **Conséquence** : toute page hors `[locale]` (comme `/offline`) doit rendre sa propre structure HTML complète et ses styles inline.
- La fonction middleware s'appelle `proxy` (pas `middleware`) dans `src/proxy.ts`.
- **Matcher middleware** : `["/((?!api|_next|_vercel|offline|sw.js|manifest.webmanifest|.*\\..*).*)"]` + garde explicite dans la fonction pour `/offline` et `/sw.js`.
- Le middleware Edge vérifie la **présence** du cookie, pas sa validité (contrainte Edge Runtime). La vraie validation a lieu dans `requireSession()` côté Node. (D-008)

---

## 8. Décisions documentées (DECISIONS.md — 16 entrées)

| ID | Décision |
|---|---|
| D-001 | Horaires en **saisie manuelle** (calcul adhan = suggestion optionnelle uniquement) |
| D-002 | Pas d'API REST séparée — **Server Actions uniquement** |
| D-003 | ~~Modèle B~~ → **réécrit en Modèle C** (inscription self-service). ⚠️ décision documentée mais implémentation cassée — voir §9bis |
| D-004 | Relation admin↔mosquée via **table de jonction** `mosque_admins` |
| D-005 | Build `next build --webpack` **obligatoire** (Turbopack incompatible serwist) |
| D-006 | Cache hors-ligne en **localStorage** (cache RSC impossible de façon fiable) |
| D-007 | **Audio uniquement** (pas d'images ni de documents) |
| D-008 | Middleware Edge : présence cookie sans vérification de validité |
| D-009 | Module `authorization.ts` : logique pure sans dépendance DB |
| D-010 | Serwist revision à **incrémenter manuellement** à chaque modif de `/offline` |
| D-011 | **Aucune photo de personne** dans l'interface |
| D-012 | Jumu'ah : affichée toute la semaine, **active uniquement le vendredi** (remplace Dhuhr, avec note discrète conservant l'heure de Dhuhr) |
| D-013 | Domaine `amanaconnect.org` sur Cloudflare, **domaine primaire**, redirect 307 depuis vercel.app |
| D-014 | Procédure migration BDD : **génération Drizzle + application manuelle** dans Neon |
| D-015 | Gestion des abonnements : statut et dates dans la table `mosques` |
| D-016 | Tests super-admin sur les Server Actions |
| D-017 | Rôles granulaires support/billing — ⚠️ code présent mais **jamais appelé** (§9bis) |
| D-018 | MFA TOTP « obligatoire » super-admins — ⚠️ **non appliqué à la connexion**, décoratif (§9bis) |
| D-019 | Récupération d'urgence — ⚠️ **cassée** (colonne trop courte, page absente, expiration non vérifiée) (§9bis) |
| D-020 | Tests E2E Playwright — ⚠️ fichiers présents mais **non exécutés en CI, avec bugs** (§9bis) |

---

## 9. Modules stables (déployés et vérifiés)

**Horaires de prière** — modèle adhan/iqama + Jumu'ah, saisie manuelle primaire. Le vendredi, Jumu'ah remplace Dhuhr dans le tableau, l'heure de Dhuhr reste en note discrète (anti-jahàla : info due à ceux qui ne font pas la congrégation). Compte à rebours prochaine prière. Bouton « Suggérer » (calcul adhan) = aide au remplissage uniquement.

**Annonces** — CRUD, épinglage, publication/brouillon, pages de détail, pagination, expiration automatique, audio.

**Événements** — CRUD, à venir + archive des passés, pages de détail, pagination.

**Membres** — imam, sages, conseillers, équipe. **Liste non publique** (visible seulement après accord explicite des personnes).

**Audio** — enregistrement micro depuis l'interface OU sélection de fichier, upload vers **Cloudflare R2**, lecteur public dans annonces/événements. Formats acceptés : MP3, OGG, M4A, AAC, AMR, 3GP (formats natifs Android). Taille max 5 Mo. Isolation par `mosqueId` dans la clé R2.

**Dons Orange Money** — numéro par mosquée, validation format guinéen (9 chiffres, commence par 6), affichage en clair + bouton `tel:` + bouton USSD `*144*1*1*NUMERO#` + copie presse-papiers. Note explicite sur limitation iOS. Mention anti-gharar : « la plateforme ne traite et ne touche aucun argent ».

**Abonnements** — 5 statuts (`trial`, `active`, `expiring_soon` J-7, `expired`, `suspended`). Blocage de l'espace admin si expiré/suspendu (redirect vers `/admin/subscription-expired`). Bannière J-7 + badge J-14 dans le dashboard. Pas de suspension automatique (décision volontaire, contrôle humain). Bouton WhatsApp de rappel pré-rédigé FR/AR.

**Paiements** — table `payments` (montant GNF, méthode, période couverte, qui a enregistré). Tableau de bord super-admin.

**PWA / Offline** — Serwist, `NetworkFirst` sur les navigations, cache de **données** en localStorage (`offline-cache.ts` + `OfflineCacheRecorder.tsx`), page `/offline` autonome affichant les dernières données connues **avec leur date** (anti-gharar), `OfflineBanner.tsx` sticky.

**Écriture résiliente** — `use-draft-persistence.ts` : sauvegarde périodique (3s) du formulaire, propose restauration si brouillon trouvé. Intégré dans AnnouncementForm, EventForm, MemberForm. **PAS sur PrayerTimesForm** (champs contrôlés, saisie courte — israf d'adapter).

**Audit log** — 15 types d'actions journalisées, dont les connexions réussies/échouées (avec IP). Page `/admin/activity` (par mosquée) et `/super-admin/activity` (globale, regroupée par mosquée).

**Sélecteur de mosquée super-admin** — cookie sécurisé, permet au super-admin de gérer n'importe quelle mosquée depuis l'espace admin normal.

**Page santé** (`/super-admin/health`) — mosquées sans horaires, sans annonces, dernière connexion admin, alerte inactivité 14 jours.

**Page profil admin** (`/admin/profile`) — changer nom et mot de passe sans passer par le super-admin.

**Sécurité** — `disableSignUp: true` (inscription publique bloquée **côté serveur**, pas juste l'UI), création de comptes via `hashPassword` de `better-auth/crypto` directement en BDD, `rel="noopener noreferrer"` sur les liens externes, protection peer-to-peer entre super-admins.

**i18n** — 481 clés × 3 langues (FR/EN/AR), RTL arabe complet, synchronisation vérifiée.

**CI/CD** — GitHub Actions : `tsc --noEmit` + `vitest run` + `coverage` (seuils 80% lignes/fonctions, **bloquant**).

---

## 9bis. Chantier de sécurité en cours — NON FUSIONNÉ, vérifié le 19 juillet 2026

Ce chantier a été écrit après `53e8e53` et n'est **ni commité, ni testé, ni majoritairement branché**. Il a été audité fichier par fichier. Verdict global : **bonne intention (casser le bus factor, cf §13), exécution non terminée.** `tsc --noEmit` passe (exit 0) et les 148 tests passent — mais **compiler n'est pas fonctionner**.

### Ce qui est réellement branché dans l'app vivante
- **Inscription self-service** (`disableSignUp: false` + `/register` monte `SelfServiceRegisterForm` → action `selfServiceRegister`) + colonnes de schéma + migration `0001_add_roles_mfa_emergency_recovery.sql` + `.env.example`. C'est tout.

### Code mort — écrit mais importé par 0 fichier (vérifié par grep)
| Module | Importateurs réels |
|---|---|
| `src/lib/mfa.ts` + `mfa.actions.ts` (setupTOTP/confirmTOTP/disableTOTP) | **0** |
| `src/components/admin/MFASetup.tsx` | **0** (jamais monté sur une page) |
| `src/lib/actions/emergency-recovery.actions.ts` | **0** |
| `src/components/admin/EmergencyEmailSetup.tsx` | **0** |
| `src/lib/alerts.ts` (Slack/Twilio/email) | **0** |
| `src/lib/super-admin-logger.ts` | **0** |
| `authorization.ts` → `canViewMosque`, `isSupport`, `isBilling`, `isAdminLevel` | **0** |
| `self-service.actions.ts` → `completeSetup` | **0** |

➡️ Tout le « niveau sécurité » (MFA, récupération, rôles support/billing, alertes) est du **code débranché**. C'est de l'israf à grande échelle : exactement le travers « code écrit avant le besoin » du §16, mais multiplié.

### Bugs confirmés sur la partie branchée et documentée

1. **MFA non appliqué — décoratif.** `verifyTOTPCode` n'est appelé QUE dans `confirmTOTP` (l'écran de setup). **Aucun contrôle TOTP à la connexion.** Better-Auth ne connaît pas le champ `totpSecret` custom. Un super-admin avec `totpEnabled=true` se connecte quand même avec email+mot de passe seuls. ➡️ **D-018 « MFA obligatoire pour super-admins » est faux dans les faits.**

2. **Inscription self-service : email de vérification jamais envoyé (gharar + ghich).** `selfServiceRegister` écrit l'utilisateur **directement en BDD** (contourne l'API Better-Auth), donc `sendOnSignUp: true` **ne se déclenche jamais**. Le commentaire du code affirme le contraire (« Better-Auth enverra automatiquement l'email ») — c'est factuellement faux. Combiné à `requireEmailVerification: true`, le nouvel inscrit **ne reçoit aucun email et ne peut pas se connecter**. Le message i18n `registerSuccess` lui dit pourtant « Vérifiez votre email pour activer votre compte » → **on annonce une action qui n'arrive pas.**

3. **`isPendingSetup` ne garde rien.** Le flag est posé à `true` à l'inscription mais **n'est vérifié nulle part**. Il ne bloque aucun accès. La promesse « doivent vérifier leur email avant d'accéder au panel » n'a pas de mécanisme.

4. **Récupération d'urgence cassée par la longueur de colonne.** Le token = `crypto.randomUUID()` (**36 caractères**) est stocké dans `totp_secret varchar(32)`. Postgres rejette (`value too long`) → l'`UPDATE` lève une exception → l'email n'est jamais envoyé. De plus : **la page `/emergency-recovery` n'existe pas** (l'email pointerait vers un 404), **l'expiration 1 h n'est jamais vérifiée** (le code l'admet en commentaire), et le token réutilise `totpSecret` → activer la récupération **écraserait le secret MFA** d'un compte protégé (bombe à retardement latente). ➡️ **D-019 est non fonctionnel.**

5. **Régression doctrinale : réouverture de l'inscription publique sans modération.** `disableSignUp: false` réactive AUSSI l'endpoint natif `POST /api/auth/sign-up/email` (le §9 « stable » se vantait qu'un `curl` renvoyait 403 — ce n'est plus vrai). N'importe qui peut créer des comptes + des mosquées `trial` en production, sans validation humaine, dans une base multi-tenant. Vecteur de spam/abus + gharar (données non vérifiées présentées comme des mosquées).

### Tests E2E Playwright (D-020) — 4ᵉ apparition du même mirage
Les fichiers `e2e/*.spec.ts` existent enfin, mais : un seul navigateur actif (firefox/webkit commentés), **jamais exécutés en CI** (la CI ne lance que Vitest), exigent un Postgres local + build complet, et **contiennent des bugs** (ex : `self-service-registration.spec.ts` remplit `input[name="fullName"]` alors que le formulaire réel utilise `name="name"` → test voué à l'échec). Fonctionnellement, c'est le même piège que les 3 titres de commit trompeurs signalés au §16 : l'apparence de l'E2E sans la substance.

### DECISIONS.md documente des décisions comme actées alors qu'elles sont mortes/cassées
D-003 a été réécrit (Modèle B → Modèle C), D-017 à D-020 ajoutés. Ces entrées décrivent des fonctionnalités **comme si elles étaient livrées**. C'est l'anti-ghich retourné contre le journal de décisions lui-même.

### Ce qui est propre malgré tout (pour être juste)
- `mfa.ts` utilise correctement `otpauth` (TOTP standard, fenêtre de tolérance d'horloge).
- Les fonctions d'autorisation ajoutées sont des fonctions **pures** bien écrites (juste jamais appelées).
- La migration `0001` est correctement générée et cohérente avec `schema.ts`.
- `.env.example` a enfin été créé (résout un TODO du §13).
- L'intention — MFA + récupération + 2ᵉ niveau d'admin pour casser le bus factor — est la **bonne** (cf §13). Le problème n'est pas l'idée, c'est le « fini à 30 % et documenté à 100 % ».

### Décision à prendre AVANT tout autre code (recommandation tranchée)
**Ne pas commiter ce working tree tel quel.** Deux options, pas de demi-mesure :
- **A (recommandée maintenant) — revenir en arrière proprement :** `git stash` / mettre de côté tout le chantier, garder UNIQUEMENT `.env.example`. Rétablir `disableSignUp: true` (Modèle B) pour ne pas laisser l'inscription publique cassée en prod. Revenir au terrain (§18). C'est la voie anti-israf.
- **B — finir une seule chose de bout en bout :** choisir *soit* MFA réel (contrôle TOTP à la connexion) *soit* self-service correct (envoi email via l'API Better-Auth + garde `isPendingSetup`), l'écrire jusqu'au test qui prouve qu'elle marche, supprimer TOUT le reste (code mort), puis commiter. Une fonctionnalité vivante et prouvée vaut mieux que quatre débranchées.

En l'état, ce chantier n'améliore pas la sécurité — il ajoute de la surface (inscription publique ouverte) sans les garde-fous annoncés.

---

## 10. Tests — 148 au total (10 fichiers), 0 sur le nouveau chantier

| Fichier | Tests |
|---|---|
| `src/test/prayer-times.test.ts` | 29 |
| `src/test/announcement.utils.test.ts` | 26 |
| `src/test/authorization.test.ts` | 21 |
| `src/test/superadmin.actions.test.ts` | 21 |
| `src/lib/__tests__/orange-money.test.ts` | 12 |
| `src/test/announcement.actions.test.ts` | 10 |
| `src/test/member.actions.test.ts` | 10 |
| `src/test/event.actions.test.ts` | 9 |
| `src/lib/__tests__/audio-link.test.ts` | 5 |
| `src/lib/__tests__/mosque-name.test.ts` | 5 |

⚠️ **Ces 148 tests couvrent tous du code d'AVANT le chantier §9bis.** MFA, self-service, récupération d'urgence, rôles support/billing : **0 test**. La zone la plus sensible de la plateforme (auth) est ajoutée sans aucune preuve — violation directe du principe D-016 (« la zone la plus sensible ne doit pas reposer uniquement sur de la documentation »).

---

## 11. Documentation (7 fichiers markdown à la racine)

`README.md` · `ARCHITECTURE.md` · `DECISIONS.md` · `SCHEMA.md` · `SECURITY.md` · `DESIGN.md` · `CONTRIBUTING.md`

**Dossier `terrain/`** (dans `.gitignore`, local uniquement) :
`README.md` · `script-presentation.md` · `guide-demo.md` · `fiche-questions.md` · `suivi-visites.md` · `engagement-client.md` · `recu-paiement.md` · `suivi-paiements.md`

**Guides utilisateur PDF** (dans `public/guides/`) : admin + public × FR/EN/AR = 6 PDF, téléchargeables depuis le footer public et les paramètres admin.

---

## 12. État de l'entreprise (au 9 juillet 2026)

| Indicateur | Valeur |
|---|---|
| **Mosquées actives** | **4** (TAQWA pilote + Kokoma + 2 autres) |
| Admins dédiés | 4 |
| Utilisation réelle | ✅ Horaires saisis, admins actifs |
| **Revenu** | **0 GNF** |
| Statut abonnements | Toutes en période gratuite |
| Statut juridique | Aucun (personne physique) |
| Visites terrain effectuées | ~4 |

**Modèle économique décidé :**
- Période gratuite : **3 mois** à partir du premier contenu saisi (extension 3 mois cas par cas si justifié)
- Après expiration : **admin bloqué, données conservées** (jamais d'effacement)
- Prix : **40 000 GNF/mois** (à valider avec les premières conversions — actuellement codé en dur dans le message WhatsApp)
- Paiement : **espèces ou Orange Money**, reçu écrit systématique
- **Aucune commission** sur dons ou zakat
- Tarif fondateurs : réduction à vie pour les 10 premières mosquées payantes

---

## 13. Ce qui reste à faire

### Technique — CRITIQUE, à trancher AVANT tout (chantier §9bis)
- [ ] **Décider A ou B pour le working tree non commité** (cf §9bis, dernière sous-section). Ne rien commiter tel quel.
- [ ] Si on garde l'inscription : **envoyer réellement l'email de vérification** (passer par l'API Better-Auth, pas un insert direct) OU rétablir `disableSignUp: true`. Ne pas laisser une inscription qui promet un email jamais envoyé.
- [ ] Ne pas laisser `disableSignUp: false` en prod sans modération (spam de mosquées).
- [ ] Si on garde le MFA : **le vérifier à la connexion** (aujourd'hui décoratif) — sinon retirer le module.
- [ ] Récupération d'urgence : colonne `totp_secret varchar(32)` trop courte pour un token UUID (36) + page `/emergency-recovery` inexistante + expiration non vérifiée + collision avec le secret MFA. À refaire (table dédiée) ou retirer.
- [ ] Supprimer le code mort si non finalisé (mfa, emergency-recovery, alerts, super-admin-logger, canViewMosque/isSupport/isBilling, MFASetup, EmergencyEmailSetup).

### Technique — points ouverts hérités (toujours valides)
- [ ] **Variables R2 sur Vercel** — 5 variables à confirmer en Production, sinon tout upload audio plante
- [ ] **Migration `0002_payments_table.sql`** — confirmer application en BDD Neon
- [ ] **Documenter les 5 variables R2** dans `ARCHITECTURE.md` ou créer un `.env.example`
- [ ] **`pnpm-workspace.yaml` cassé** — champ `packages` absent, `pnpm install` échoue sur un clone frais (contournable via npm, mais bloquant pour un collaborateur)
- [ ] **`deleteAudioFile`** ne vérifie pas que le fichier appartient à la mosquée de l'admin (mineur, URLs R2 non-devinables)
- [ ] Commentaire erroné ligne ~56 de `schema.ts` (`// lien de don externe` sur `subscriptionStatus`)
- [ ] 3 fonctions orphelines documentées : `getMemberById`, `getPaymentsByMosque`, `isUserAdminOfMosque`

### Business — LE vrai levier
- [ ] **Conversion : préparer les conversations à J-30** de chaque expiration
- [ ] **Rythme de 3 visites terrain/semaine** — non négociable
- [ ] Remplir `suivi-visites.md` après CHAQUE visite (dans l'heure)
- [ ] Objectif : **20 mosquées actives avant Ramadan 2027** (~février 2027)
- [ ] Formalisation juridique (APIP) — déclencheur : 10 mosquées payantes
- [ ] **Vercel Pro** dès le premier franc encaissé (le plan Hobby interdit l'usage commercial)
- [ ] Compte Orange Money **dédié entreprise**, séparé du personnel
- [ ] Casser le bus factor : 2ᵉ compte super-admin scellé, document de reprise chiffré, restauration Neon testée une fois

### Post-terrain (> 5 mosquées payantes)
- Tests E2E Playwright (jamais faits malgré 3 titres de commit trompeurs)
- Export CSV des paiements
- Tarification différenciée
- Diaspora et sous-région (Mali, Sénégal, Côte d'Ivoire)
- Module caisse (18+ mois, projet séparé)

---

## 14. Méthode de collaboration attendue

- **Français**, exhaustif, franc, **critique constructive non filtrée**.
- Cadrer avec des questions **avant** de coder (décisions A/B/C tranchées, pas de « ça dépend »).
- Évaluer chaque proposition contre **les 4 interdits + israf**.
- **Vérifier le code au compilateur (`tsc --noEmit` + `vitest run`) AVANT de livrer.** Ne jamais livrer de fichier tronqué.
- **Toujours travailler sur les fichiers RÉELS** (resynchroniser sur `origin/main`), jamais de mémoire.
- Ne pas présumer la fin d'un chantier (« c'est bouclé » suivi de la suite du chantier est un travers à éviter).
- **Pousser back avec honnêteté** quand une demande est de l'israf ou techniquement bancale.
- **Rappeler systématiquement que le terrain prime sur le code.** Chaque audit doit se terminer sur l'état réel de l'entreprise, pas seulement du produit.

---

## 15. Leçons & pièges techniques (à ne pas réapprendre)

- **Turbopack incompatible serwist** : `next build --webpack` obligatoire.
- **Cache RSC offline impossible** : passer par localStorage (données, pas pages).
- **Middleware next-intl intercepte tout** : exclure explicitement les routes spéciales (offline, sw.js) du matcher ET par une garde dans la fonction.
- **Page autonome hors `[locale]`** : doit rendre son propre html/body + styles inline.
- **Révision serwist** : incrémenter à chaque modif des fichiers précachés.
- **`disableSignUp: true` bloque aussi `auth.api.signUpEmail()`** — pour créer des comptes en tant que super-admin, écrire directement en BDD avec `hashPassword` de `better-auth/crypto` (tables `users` + `account`, providerId `credential`).
- **Le schéma Drizzle ne crée rien en BDD** — chaque `index()`, `onDelete: cascade`, nouvelle colonne ou table nécessite un SQL appliqué manuellement dans Neon.
- **Anti-gharar offline** : afficher la date des données en cache.
- **Anti-ghich CV/commits** : ne lister que les technos avec projet démontrable ; un titre de commit dit exactement ce qu'il fait.
- **Vérifier au compilateur AVANT de livrer.**

---

## 16. Mauvaises habitudes identifiées (à corriger)

Observées dans l'historique git réel, aucune grave isolément, mais formant des patterns :

1. **Titres de commits trompeurs** — « Tests E2E sur flux critiques » est apparu **3 fois** sans qu'aucun test E2E n'existe. Anti-ghich appliqué à soi-même.
2. **Commits fourre-tout** — « CI + pagination admin + index BDD » : 3 chantiers sans rapport. Un commit = un sujet.
3. **Push avant vérification** — plusieurs séquences de commits qui se corrigent en quelques heures (double import `headers`, `PaginatedResult` manquant, **virgules JSON invalides en production**).
4. **Code écrit avant le besoin** — 3 fonctions orphelines. Israf léger.
5. **Ratio code/terrain déséquilibré** — des dizaines de commits, 4 mosquées. Le code est la zone de confort ; le terrain est l'inconfort où se trouve la croissance.
6. **Documentation d'infrastructure manquante** — 5 variables R2 non documentées, pas de `.env.example` (⚠️ ce dernier point est **corrigé** : `.env.example` existe désormais), `pnpm-workspace.yaml` cassé.

**Nouveaux patterns identifiés au 19 juillet 2026 (chantier §9bis) :**

7. **Code mort à grande échelle** — un « niveau sécurité » entier (MFA, récupération, rôles, alertes, logger) écrit puis importé par 0 fichier. Le §16.4 (« code écrit avant le besoin ») était léger ; ici c'est le pattern dominant du chantier.
8. **DECISIONS.md documente des fonctionnalités non livrées** (D-017 à D-020) comme si elles étaient actées. L'anti-ghich (§3) retourné contre son propre journal de décisions.
9. **E2E annoncé pour la 4ᵉ fois sans être vivant** — les fichiers existent enfin mais ne tournent pas en CI, contiennent des bugs, et testent des flux eux-mêmes cassés.
10. **Compiler confondu avec fonctionner** — `tsc` vert + 148 tests verts ont masqué que la nouvelle auth ne marche pas. Les tests verts portent sur l'ancien code ; le neuf n'est pas testé.
11. **Sécurité affaiblie sous couvert de la renforcer** — on a rouvert l'inscription publique (surface d'attaque) sans livrer les garde-fous (MFA réel, vérification email). Le solde net est négatif.

---

## 17. Le chemin vers 6/10 pour l'entreprise

*Produit ≈ 9/10. Entreprise ≈ 2/10 — non par échec, mais parce qu'elle commence.*

| Preuve à obtenir | Palier |
|---|---|
| 1ʳᵉ mosquée payante | 3/10 |
| Taux de conversion connu sur 20+ visites | 4/10 |
| 1er renouvellement (2ᵉ mois payé) | 5/10 |
| 10 payantes + statut juridique + procédures | **6/10** |

**Rythme hebdomadaire cible :** 3 visites terrain (4-5h) · suivi mosquées existantes (1-2h) · mise à jour tableaux (30 min) · **code : 0h par défaut**, uniquement si un blocage terrain l'exige.

**Le calcul du milliard, honnêtement :** 1 milliard GNF ≈ 115 000 USD. Par les abonnements guinéens seuls, c'est 4+ ans à 500 mosquées payantes. Le vrai chemin est la **valorisation d'entreprise** : à ~250 M GNF de revenus annuels récurrents (~520 mosquées), l'entreprise vaut 1-2 milliards GNF. Milliardaire en patrimoine, pas en cash — comme presque tous les fondateurs. Leviers d'accélération : **diaspora et sous-région** (devises fortes), **tarification différenciée**, **Ramadan comme moteur commercial**.

**Financement halal :** pas de dette à intérêt. Autofinancement (voie actuelle) ou plus tard musharaka (investisseur en parts réelles, partageant profits ET pertes).

---

## 18. La vérité qui prime sur tout le reste

**Le code ne me rendra pas milliardaire — il en est déjà capable.**

Ce qui m'en sépare est un seul nombre : **le nombre de conversations de vente que j'ai par semaine.** Aujourd'hui ce nombre est proche de zéro, et chaque commit supplémentaire est une façon confortable de ne pas l'augmenter.

Passer l'entreprise de 2 à 6 vaut cent fois plus que passer le produit de 9 à 9,5. Et ça ne demande aucune ligne de code.
