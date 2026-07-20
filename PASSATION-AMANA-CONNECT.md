# Amana Connect — Document de passation complet

> **Document de référence unique.** Dans une nouvelle conversation, colle-le en premier : il contient tout le contexte du projet (qui je suis, ce que je construis, selon quelles règles, où en est le code, ce qui est décidé, ce qui reste à faire).
> **Dernière mise à jour : 19 juillet 2026.** Base de code : `main` @ commit `53e8e53` (propre). Tous les faits techniques ci-dessous ont été **vérifiés directement dans le code**, pas de mémoire.
> **Feuille de route stratégique (aujourd'hui → objectif final) : voir le fichier séparé [`FEUILLE-DE-ROUTE.md`](FEUILLE-DE-ROUTE.md).**

---

## 0. Comment utiliser ce document

Ce que j'attends de l'assistant (détail en §20) : **français, exhaustif, franc, critique non filtrée, décisions tranchées, vérification au compilateur avant toute livraison, et rappel systématique que le terrain prime sur le code.**

Ce document décrit le **produit et l'entreprise**. Le **plan d'action daté** est dans `FEUILLE-DE-ROUTE.md`. Les deux se lisent ensemble.

---

## 1. Qui je suis

**Abdoulaye Bah** (alias Abdallah), étudiant en **Licence 3 Génie Logiciel** à l'**Université Nongo Conakry (UNC)**, en Guinée. Je construis **seul** une plateforme SaaS, avec l'objectif de lancer une vraie entreprise logicielle **100 % halal**, sans capital de départ.

**Contacts / liens :**
- E-mail : abdallahmarly90@gmail.com
- Téléphone : +224 626 736 219 / 669 55 36 00
- GitHub : github.com/Abdallahguest (repo : `mosquee-platform`)
- LinkedIn : linkedin.com/in/abdoulaye-bah-9405872b7
- Production : **amanaconnect.org** (domaine primaire, redirect 307 depuis mosquee-platform.vercel.app)
- Super-admin de test : abdallahmarly90@gmail.com

**Contexte personnel :**
- Je travaille **surtout sur mobile**, je teste visuellement depuis mon téléphone sur Vercel. L'assistant ne voit pas mon écran : **la validation visuelle, c'est moi.**
- **GitHub Student Developer Pack** actif jusqu'au 23 mai 2028 (Copilot Student, 200 crédits IA/mois, JetBrains, Notion, DigitalOcean 200 $, Azure 100 $).
- Je postule en parallèle à des postes de développeur. **Cette tension stage/startup n'est pas encore tranchée** — voir FEUILLE-DE-ROUTE §« Ma situation ».

---

## 2. Le projet : Amana Connect

Plateforme **SaaS multi-tenant de gestion de mosquées**. Chaque mosquée dispose de :
- une **page publique** : horaires de prière, annonces, événements, membres, dons Orange Money ;
- un **espace admin** : gestion du contenu de sa mosquée ;
- au-dessus, un **super-admin** qui crée les mosquées et les comptes, et gère les abonnements.

**Le succès se mesure à un déploiement réel validé par des utilisateurs de terrain, pas à des lignes de code.**

---

## 3. Cadre doctrinal NON-NÉGOCIABLE

Toute décision (technique, UX, business) passe par ces principes du *fiqh al-muamalat* :

- **Riba** (intérêt) — interdit. Aucun frais d'intérêt, aucune dette, aucune pénalité de retard.
- **Gharar** (incertitude trompeuse) — interdit. Ex : jamais d'horaires périmés affichés comme certains ; toujours dater une donnée en cache ; bandeau si l'abonnement a expiré.
- **Ghich** (tromperie) — interdit. Ex : ne pas lister sur le CV des technos sans projet réel ; ne pas annoncer une fonctionnalité qui n'existe pas ; **un titre de commit dit exactement ce que fait le commit.**
- **Jahàla** (ignorance imposée) — interdit. L'utilisateur doit comprendre ce qui se passe (messages explicatifs, transparence, décompte avant suppression).
- **Israf** (gaspillage / sur-ingénierie) — vigilance active. Ne pas construire une usine pour un besoin simple. *(Leçon dure du 19/07 : cf §17.)*

**Règles absolues supplémentaires :**
- **AUCUNE photo de personne dans l'interface, jamais.** (D-011)
- **Aucune commission sur les dons ou la zakat.** Jamais.
- **Ne JAMAIS exécuter le seed (`pnpm db:seed`) contre la production.**
- **Financement sans riba** : autofinancement, ou plus tard *musharaka* (partage réel des profits ET des pertes). Jamais de dette à intérêt.

---

## 4. État en un coup d'œil (19 juillet 2026)

| Dimension | État |
|---|---|
| **Produit** | ≈ **9/10** — stable, déployé, testé, sans dette cachée |
| **Entreprise** | ≈ **2/10** — non par échec, mais parce qu'elle *commence* |
| Mosquées actives | **4** (TAQWA pilote + Kokoma + 2 autres) |
| **Revenu** | **0 GNF** — toutes en période gratuite |
| Mosquées payantes | **0** ← *le seul chiffre qui compte aujourd'hui* |
| Statut juridique | Aucun (personne physique) |
| Tests | **148 verts** (10 fichiers), `tsc --noEmit` vert |
| Branche `main` | `53e8e53`, propre, `disableSignUp: true` (Modèle B) |
| Chantier sécurité | **écarté** → branche `wip/securite-mise-de-cote-2026-07` (voir §17) |

---

## 5. Stack technique (versions exactes, vérifiées)

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
| Paquets | pnpm | 10.0.0 |
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
> Hook **pre-commit** = `pnpm test:run` (les 148 tests tournent à chaque commit).

---

## 6. Variables d'environnement

Documentées et à jour dans **`.env.example`** (à la racine). Groupes :
- **Base de données** : `DATABASE_URL` (Neon)
- **Auth** : `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`
- **E-mail (Resend)** : `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME`
- **Audio (Cloudflare R2)** : `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- **Sentry** : `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
- **Système** (Vercel/Next) : `NODE_ENV`, `NEXT_RUNTIME`

⚠️ **À confirmer en Production Vercel : les 5 variables R2**, sinon tout upload audio plante.

---

## 7. Contraintes opérationnelles (Guinée)

- **Réseau instable** (Conakry → serveurs européens) : coupures fréquentes, données mobiles chères et capricieuses.
- **Build local impossible** : Turbopack échoue sous Windows (erreur os 1450 — ressources, pas un bug de code).
- **Workflow obligatoire** : coder en local → `pnpm exec tsc --noEmit` → `pnpm vitest run` → commit → push → **tester en PRODUCTION** sur Vercel.
- **Toutes les opérations BDD directes** → éditeur SQL de **Neon** (contourne l'instabilité réseau locale).
- **PWA tenace** : pour tester une nouvelle version du SW → désinstaller/réinstaller la PWA + effacer les données du site.
- **Brave Shields** bloque parfois les dashboards (Cloudflare, Vercel) — désactiver pour ces sites si un bouton ne répond pas.

---

## 8. Architecture

### 8.1 Base de données — 12 tables (vérifiées dans `schema.ts`)

| Table | Rôle |
|---|---|
| `mosques` | Mosquées (multi-tenant) : identité, horaires, Orange Money, abonnement |
| `users` | Comptes (Better-Auth), champ `role` (`admin` / `super_admin`) |
| `account` | Mots de passe hashés (Better-Auth, providerId `credential`) |
| `session` | Sessions actives |
| `verification` | Tokens de vérification email |
| `mosque_admins` | Jonction admin ↔ mosquée (CASCADE) |
| `mosque_members` | Imams, sages, conseillers, équipe (CASCADE) |
| `announcements` | Annonces (CASCADE sur mosque_id, NO ACTION sur author_id) |
| `events` | Événements (CASCADE sur mosque_id) |
| `audit_log` | Journal d'activité (15 types d'actions) |
| `payments` | Historique des paiements (montant GNF, méthode, période) |
| `rate_limit` | Limitation de débit (Better-Auth) |

**FK notables :** `announcements.author_id` → **NO ACTION** (volontaire : ne pas effacer les annonces si un compte disparaît). Tout le reste des liens mosquée → **CASCADE**.
**Abonnement** (dans `mosques`, D-015) : `trial_ends_at`, `paid_until`, `subscription_status`.

### 8.2 Séparation des rôles (codes couleur stricts)
- **Super-admin** (indigo) : crée mosquées + comptes, gère les abonnements.
- **Admin** (vert) : gère uniquement le contenu de SA mosquée.
- **Espace public** (vert distinct).

### 8.3 Routes — 32 pages
- **Public** : `/`, `/m/[slug]`, `/m/[slug]/announcements(/[id])`, `/m/[slug]/events(/[id])`, `/privacy`, `/offline`
- **Auth** : `/login`, `/register` (désactivée → Modèle B), `/forgot-password`, `/reset-password`
- **Admin** : `/admin`, `/admin/activity`, `/admin/announcements(/[id]/edit)`, `/admin/events(/[id]/edit)`, `/admin/members`, `/admin/profile`, `/admin/select-mosque`, `/admin/settings`, `/admin/subscription-expired`
- **Super-admin** : `/super-admin`, `/super-admin/activity`, `/super-admin/health`, `/super-admin/mosques(/new, /[id]/edit, /[id]/admins)`, `/super-admin/subscriptions`, `/super-admin/users`

### 8.4 Points d'architecture critiques
- `src/app/layout.tsx` (racine) fait juste `return children` — **il ne rend PAS `<html>`/`<body>`** (ils sont dans `src/app/[locale]/layout.tsx`). Toute page hors `[locale]` (ex : `/offline`) doit rendre sa propre structure HTML + styles inline.
- La fonction middleware s'appelle **`proxy`** (pas `middleware`) dans `src/proxy.ts`.
- Matcher middleware : `["/((?!api|_next|_vercel|offline|sw.js|manifest.webmanifest|.*\\..*).*)"]` + garde explicite pour `/offline` et `/sw.js`.
- Le middleware Edge vérifie la **présence** du cookie, pas sa validité (contrainte Edge). Vraie validation dans `requireSession()` côté Node. (D-008)

---

## 9. Server Actions (le « backend »)

Pas d'API REST (D-002) — toutes les mutations passent par des Server Actions, avec Zod + auth + DB dans le même fichier. Fichiers dans `src/lib/actions/` :

`announcement.actions.ts` · `event.actions.ts` · `member.actions.ts` · `mosque.actions.ts` · `subscription.actions.ts` · `superadmin.actions.ts` · `profile.actions.ts` · `upload-audio.actions.ts` · `select-mosque.actions.ts` · `auth-log.actions.ts` · `get-ip.actions.ts` · `export.actions.ts` (`exportMosqueData`) — + helpers `action-result.ts`, `prayer-times.ts`, `prayer-times-types.ts`.

---

## 10. Modules stables (déployés et vérifiés)

- **Horaires de prière** — adhan/iqama + Jumu'ah, saisie manuelle primaire (D-001). Vendredi : Jumu'ah remplace Dhuhr, l'heure de Dhuhr reste en note discrète (anti-jahàla). Compte à rebours. Bouton « Suggérer » = calcul adhan, aide au remplissage uniquement.
- **Annonces** — CRUD, épinglage, publication/brouillon, détail, pagination, expiration auto, audio.
- **Événements** — CRUD, à venir + archive, détail, pagination.
- **Membres** — imam, sages, conseillers, équipe. **Liste non publique** (accord explicite requis).
- **Audio** — enregistrement micro OU sélection de fichier → **Cloudflare R2**, lecteur public. Formats : MP3, OGG, M4A, AAC, AMR, 3GP. Max 5 Mo. Isolation par `mosqueId`.
- **Dons Orange Money** — numéro par mosquée, validation format guinéen (9 chiffres, débute par 6), affichage clair + `tel:` + USSD `*144*1*1*NUMERO#` + copie. Note limitation iOS. Mention anti-gharar : « la plateforme ne traite et ne touche aucun argent ».
- **Abonnements** — 5 statuts (`trial`, `active`, `expiring_soon` J-7, `expired`, `suspended`). Blocage admin si expiré/suspendu. Bannière J-7 + badge J-14. **Pas de suspension automatique** (contrôle humain). Bouton WhatsApp de rappel FR/AR.
- **Paiements** — table `payments`, tableau de bord super-admin, `exportMosqueData`.
- **PWA / Offline** — Serwist, `NetworkFirst`, cache **données** en localStorage, page `/offline` autonome affichant les dernières données **datées** (anti-gharar), bannière sticky.
- **Écriture résiliente** — `use-draft-persistence.ts` : sauvegarde 3s, restauration de brouillon (Annonce/Événement/Membre ; **pas** PrayerTimesForm — israf).
- **Audit log** — 15 types (dont connexions réussies/échouées avec IP). Pages `/admin/activity` + `/super-admin/activity`.
- **Sélecteur de mosquée super-admin** — cookie sécurisé.
- **Page santé** (`/super-admin/health`) — mosquées sans horaires/annonces, dernière connexion admin, alerte inactivité 14 j.
- **Profil admin** (`/admin/profile`) — nom + mot de passe en autonomie.
- **i18n** — 481 clés × 3 langues (FR/EN/AR), RTL complet.
- **CI/CD** — GitHub Actions : `tsc --noEmit` + `vitest run` + coverage (seuils 80 % lignes/fonctions, **bloquant**).

---

## 11. Décisions documentées (`DECISIONS.md` — D-001 à D-016)

| ID | Décision |
|---|---|
| D-001 | Horaires en **saisie manuelle** (adhan = suggestion) |
| D-002 | Pas d'API REST — **Server Actions uniquement** |
| D-003 | **Modèle B** : comptes créés par le super-admin *(le Modèle C self-service a été essayé puis annulé le 19/07 — voir §17)* |
| D-004 | Relation admin↔mosquée via table de jonction `mosque_admins` |
| D-005 | Build `next build --webpack` **obligatoire** (Turbopack ≠ serwist) |
| D-006 | Cache hors-ligne en **localStorage** |
| D-007 | **Audio uniquement** (pas d'images ni documents) |
| D-008 | Middleware Edge : présence cookie sans vérif de validité |
| D-009 | `authorization.ts` : logique pure sans dépendance DB |
| D-010 | Serwist revision à incrémenter manuellement (`/offline`) |
| D-011 | **Aucune photo de personne** dans l'interface |
| D-012 | Jumu'ah affichée toute la semaine, active le vendredi seulement |
| D-013 | Domaine `amanaconnect.org` sur Cloudflare, primaire, redirect 307 |
| D-014 | Migration BDD : génération Drizzle + application manuelle Neon |
| D-015 | Abonnements : statut + dates dans la table `mosques` |
| D-016 | Tests super-admin sur les Server Actions |

---

## 12. Tests — 148 au total (10 fichiers)

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

---

## 13. Documentation

**Code (8 fichiers racine)** : `README.md` · `ARCHITECTURE.md` · `DECISIONS.md` · `SCHEMA.md` · `SECURITY.md` · `DESIGN.md` · `CONTRIBUTING.md` · `PASSATION-AMANA-CONNECT.md` (ce fichier). *(+ `FEUILLE-DE-ROUTE.md`.)*

**Terrain (`terrain/`, dans `.gitignore`, local uniquement)** : `README.md` · `script-presentation.md` · `guide-demo.md` · `fiche-questions.md` · `suivi-visites.md` · `engagement-client.md` · `engagement-1page.md` · `recu-paiement.md` · `suivi-paiements.md` · `notes-kokoma.md`.

**Guides PDF (`public/guides/`)** : admin + public × FR/EN/AR = 6 PDF, téléchargeables depuis le footer public et les paramètres admin.

---

## 14. Sécurité

- `disableSignUp: true` — **inscription publique bloquée côté serveur** (même un `curl` sur `/api/auth/sign-up/email` renvoie 403). Comptes créés par le super-admin via `hashPassword` de `better-auth/crypto` directement en BDD (tables `users` + `account`, providerId `credential`).
- Rate limiting Better-Auth (5/min sign-in, 3/min reset).
- `rel="noopener noreferrer"` sur les liens externes.
- Protection **peer-to-peer** entre super-admins (impossible de se supprimer soi-même ou un autre super-admin), prouvée par `superadmin.actions.test.ts`.
- **Point faible connu, assumé : bus factor = 1.** Un seul super-admin, un seul humain. C'est le vrai risque, pas un CVE. Traité dans la FEUILLE-DE-ROUTE (procédures avant tout code).

---

## 15. État de l'entreprise (19 juillet 2026)

| Indicateur | Valeur |
|---|---|
| Mosquées actives | **4** |
| Admins dédiés | 4 |
| Utilisation réelle | ✅ Horaires saisis, admins actifs |
| **Revenu** | **0 GNF** |
| **Mosquées payantes** | **0** |
| Statut abonnements | Toutes en période gratuite |
| Statut juridique | Aucun (personne physique) |
| Visites terrain effectuées | ~4 |

---

## 16. Modèle économique (décidé, à valider par le terrain)

- Période gratuite : **3 mois** à partir du premier contenu saisi (extension 3 mois cas par cas si justifié).
- Après expiration : **admin bloqué, données conservées** (jamais d'effacement).
- Prix : **40 000 GNF/mois** (à valider avec les premières conversions — codé en dur dans le message WhatsApp).
- Paiement : **espèces ou Orange Money**, reçu écrit systématique.
- **Aucune commission** sur dons/zakat.
- **Tarif fondateurs** : réduction à vie pour les 10 premières mosquées payantes.

---

## 17. Post-mortem : le chantier sécurité écarté (Option A, 19/07/2026)

Entre le 9 et le 19 juillet, un gros chantier a été écrit sans être fusionné : **inscription self-service (Modèle C), MFA TOTP, récupération d'urgence, rôles support/billing, alertes Slack/Twilio, tests E2E Playwright.** Audité fichier par fichier, verdict :

- **~90 % de code mort** (0 importateur) : mfa, emergency-recovery, alerts, super-admin-logger, `canViewMosque/isSupport/isBilling`, composants MFASetup/EmergencyEmailSetup.
- **La seule partie branchée (self-service) était cassée** : email de vérification jamais envoyé (insert direct ≠ API Better-Auth), `isPendingSetup` ne gardait rien, et `disableSignUp: false` **rouvrait l'inscription publique sans modération** (régression doctrinale + spam).
- **MFA décoratif** (jamais vérifié à la connexion), **récupération d'urgence non fonctionnelle** (token UUID de 36 car. dans une colonne `varchar(32)`, page `/emergency-recovery` inexistante, expiration non vérifiée, collision avec le secret MFA).
- `tsc` et les 148 tests étaient verts — mais ils portaient sur l'**ancien** code. **Compiler ≠ fonctionner.**

**Décision (Option A) :** ne pas fusionner. Chantier **préservé intact** sur la branche `wip/securite-mise-de-cote-2026-07` ; `main` ramené à `53e8e53` (Modèle B rétabli). Pour reprendre un jour : `git checkout wip/securite-mise-de-cote-2026-07`, puis **finir UNE seule chose de bout en bout, prouvée par un test, et supprimer le reste** (option B). Détails des pièges à corriger d'abord : voir FEUILLE-DE-ROUTE §« Dette & reprises futures ».

---

## 18. Mauvaises habitudes identifiées (à corriger)

1. **Titres de commits trompeurs** — « Tests E2E » apparu ≥ 3 fois sans test E2E réel. Anti-ghich appliqué à soi-même.
2. **Commits fourre-tout** — un commit = un sujet.
3. **Push avant vérification** — corrections en cascade (virgules JSON invalides en prod, etc.).
4. **Code écrit avant le besoin** — culminé le 19/07 avec un « niveau sécurité » entier en code mort (§17).
5. **Ratio code/terrain déséquilibré** — le code est la zone de confort ; le terrain est l'inconfort où est la croissance.
6. **DECISIONS.md documentant du non-livré** — l'anti-ghich retourné contre son propre journal.
7. **Compiler confondu avec fonctionner** — les tests verts masquaient une auth non fonctionnelle.

---

## 19. Leçons & pièges techniques (à ne pas réapprendre)

- **Turbopack ≠ serwist** : `next build --webpack` obligatoire.
- **Cache RSC offline impossible** : passer par localStorage (données, pas pages).
- **Middleware next-intl intercepte tout** : exclure explicitement offline/sw.js (matcher + garde).
- **Page hors `[locale]`** : rendre son propre html/body + styles inline.
- **Révision serwist** : incrémenter à chaque modif des fichiers précachés.
- **`disableSignUp: true` bloque aussi `auth.api.signUpEmail()`** — pour créer des comptes : écrire en BDD avec `hashPassword` (`users` + `account`, providerId `credential`).
- **Le schéma Drizzle ne crée rien en BDD** — chaque index/cascade/colonne = un SQL appliqué manuellement dans Neon (D-014).
- **Anti-gharar offline** : afficher la date des données en cache.
- **Créer un compte via insert direct NE déclenche PAS** `emailVerification.sendOnSignUp` (leçon du chantier écarté).
- **Vérifier au compilateur ET fonctionnellement AVANT de livrer.**

---

## 20. Méthode de collaboration attendue

- **Français**, exhaustif, franc, **critique constructive non filtrée**.
- Cadrer avec des questions **avant** de coder (décisions A/B/C tranchées, pas de « ça dépend »).
- Évaluer chaque proposition contre **les 4 interdits + israf**.
- **Vérifier le code (`tsc --noEmit` + `vitest run`) ET son fonctionnement réel AVANT de livrer.** Jamais de fichier tronqué.
- **Toujours travailler sur les fichiers RÉELS** (resync `origin/main`), jamais de mémoire.
- Ne pas présumer la fin d'un chantier.
- **Pousser back avec honnêteté** quand une demande est de l'israf ou techniquement bancale.
- **Rappeler systématiquement que le terrain prime sur le code.** Chaque audit finit sur l'état réel de l'entreprise, pas seulement du produit.

---

## 21. La vérité qui prime sur tout le reste

**Le code ne me rendra pas milliardaire — il en est déjà capable.**

Ce qui m'en sépare est un seul nombre : **le nombre de conversations de vente que j'ai par semaine.** Aujourd'hui ce nombre est proche de zéro, et chaque commit supplémentaire est une façon confortable de ne pas l'augmenter.

Passer l'entreprise de 2 à 6 vaut cent fois plus que passer le produit de 9 à 9,5. Et ça ne demande **aucune ligne de code.**

➡️ **Le plan concret pour y arriver : [`FEUILLE-DE-ROUTE.md`](FEUILLE-DE-ROUTE.md).**
