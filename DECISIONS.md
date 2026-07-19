# Décisions techniques — Amana Connect

Ce document enregistre les décisions techniques importantes, leur contexte et
leur justification. Il évite de réapprendre les mêmes leçons.

---

## D-001 — Horaires en saisie manuelle (pas algorithmiques)

**Décision :** Les horaires affichés sont ceux saisis par l'imam, pas ceux
calculés par `adhan-js`. Le calcul algorithmique sert uniquement de suggestion.

**Pourquoi :** Principe anti-gharar. Les mosquées locales ont leurs propres
horaires qui ne correspondent pas toujours aux calculs astronomiques. Afficher
un calcul comme vérité serait trompeur.

**Conséquence :** 12 champs `varchar(5)` dans la table `mosques` (adhan/iqama
× 6 prières). Null = non renseigné → affiché "—".

---

## D-002 — Pas d'API REST séparée — Server Actions uniquement

**Décision :** Toutes les mutations passent par des Server Actions Next.js.
Aucune route API REST créée pour le contenu métier.

**Pourquoi :** Supprime une couche d'indirection. La validation Zod, l'auth et
la DB sont dans le même fichier. Moins de surface d'attaque, moins de code.

**Limite :** Pas d'API publique consommable par des tiers (intention délibérée).

---

## D-003 — Modèle C hybride : inscription self-service avec validation

**Décision :** L'inscription publique est activée (`disableSignUp: false`
dans Better-Auth). Les utilisateurs peuvent s'inscrire et créer leur mosquée
en mode trial (3 mois). L'email doit être vérifié avant d'accéder au panel admin.

**Pourquoi :** Pour permettre l'adoption de masse sans goulot d'étranglement
opérationnel. Le super-admin n'a plus besoin de créer manuellement chaque compte.
Les comptes créés via inscription publique sont marqués `isPendingSetup` et
doivent vérifier leur email.

**Transition :** Remplace le Modèle B (inscription désactivée) pour permettre
la scalabilité.

---

## D-004 — Relation admin↔mosquée via table de jonction

**Décision :** La relation admin↔mosquée est dans une table `mosque_admins`
(N:N), pas une FK directe sur `users`.

**Pourquoi :** Un admin peut gérer plusieurs mosquées. Une FK directe
imposerait une relation 1:N non extensible.

**Limite actuelle :** `getPrimaryMosqueByUserId()` retourne la première mosquée
alphabétiquement. Un admin multi-mosquées ne peut gérer qu'une mosquée à la
fois (pas de sélecteur). À corriger si des admins multi-mosquées apparaissent.

---

## D-005 — Build `next build --webpack` obligatoire

**Décision :** Le script `build` dans `package.json` utilise
`next build --webpack`, pas `next build`.

**Pourquoi :** Next.js 16 active Turbopack par défaut. Turbopack est incompatible
avec Serwist (le service worker n'est pas généré). Le flag `--webpack` force
le bundler webpack qui fonctionne correctement.

**À surveiller :** Si Serwist supporte Turbopack dans une version future,
retirer ce flag.

---

## D-006 — Cache hors-ligne en localStorage (pas cache SW)

**Décision :** Le cache offline passe par des snapshots en localStorage, pas
par le cache du service worker.

**Pourquoi :** Les pages Next.js App Router sont des Server Components rendus
dynamiquement. Le cache RSC ne se met pas en cache de façon fiable pour le mode
offline. Stocker les données (horaires, annonces, événements) est plus robuste.

**Anti-gharar :** Chaque snapshot porte une date `savedAt` affichée à
l'utilisateur pour qu'il sache que ce sont les dernières données connues.

---

## D-007 — Audio uniquement (pas d'images ni de documents)

**Décision :** Les annonces et événements peuvent avoir un message audio
optionnel. L'admin l'ajoute via enregistrement natif mobile ou sélection d'un
fichier existant — le fichier est stocké sur **Cloudflare R2** (pas d'images,
pas de documents, pas de galerie).

**Limites (anti-israf) :**
- Taille max : **5 Mo** (~3 min d'audio)
- Formats autorisés : WebM, MP3, M4A, MP4, OGG, AAC, AMR, 3GP
- Un seul audio par annonce/événement
- Remplacement : l'ancien fichier R2 est supprimé automatiquement

**Pourquoi R2 et pas un lien externe seul :** le besoin terrain est un message
vocal court (rappel de prière, annonce urgente). L'enregistrement direct depuis
le téléphone de l'imam est plus fiable qu'un lien Google Drive à copier-coller.
R2 reste minimal : un bucket, une politique de taille, aucune modération
d'images ni de documents.

**Implémentation :** `src/lib/r2.ts`, `upload-audio.actions.ts`,
`AudioRecorder.tsx` (admin), `AudioPlayer.tsx` (public).

---

## D-008 — Middleware Edge : présence cookie sans vérification de validité

**Décision :** Le middleware (`proxy.ts`) vérifie la présence du cookie de
session, pas sa validité cryptographique.

**Pourquoi :** Better-Auth v1 utilise des sessions en base (pas de JWT
stateless). Valider une session nécessite un accès à PostgreSQL. Le Edge Runtime
de Next.js ne peut pas accéder à Neon de façon fiable (connexions TCP non
disponibles sur certains runtimes Vercel Edge).

**Mitigation :** La vraie validation se fait dans `requireSession()` appelée
dans chaque layout protégé (côté Node.js). Un cookie expiré passera le
middleware mais sera rejeté dans les 100ms suivantes par la première requête
serveur.

---

## D-009 — Module authorization.ts : logique pure sans dépendance DB

**Décision :** `authorization.ts` contient uniquement des fonctions pures qui
reçoivent les données en paramètre et retournent une décision booléenne.

**Pourquoi :** Testabilité maximale. Toutes les règles de sécurité multi-tenant
sont couvertes par des tests unitaires sans mock de base de données. La sécurité
est vérifiable, pas implicite.

**Complément :** les garde-fous des Server Actions super-admin (suppression de
compte, protection peer-to-peer) sont couverts par `superadmin.actions.test.ts`
— voir D-016.

---

## D-016 — Tests super-admin sur les Server Actions

**Décision :** Les mutations super-admin (`superadmin.actions.ts`) sont couvertes
par des tests Vitest avec mock Drizzle, sur le même modèle que les actions admin.

**Cas CRITIQUE testés :**
- Refus si `requireSuperAdmin()` échoue (non super-admin)
- Impossible de supprimer son propre compte
- Impossible de supprimer ou modifier un autre super-admin (protection peer-to-peer)
- Impossible de supprimer un admin encore lié à une mosquée
- Création de compte : email vérifié, mot de passe hashé (Modèle B)
- Création de mosquée : statut `trial`, `trialEndsAt` à 3 mois

**Pourquoi :** Anti-ghich. La zone la plus sensible de la plateforme ne doit pas
reposer uniquement sur de la documentation — les garde-fous sont prouvés par
des tests reproductibles.

**Fichier :** `src/test/superadmin.actions.test.ts` (21 tests, juillet 2026).

---

## D-010 — Serwist revision à incrémenter manuellement

**Décision :** La révision du precache `offline` dans `next.config.ts` est
incrémentée manuellement à chaque modification de `app/offline/page.tsx`.

**Pourquoi :** Serwist utilise la révision pour invalider le cache précaché.
Sans incrémentation, le service worker continue de servir l'ancienne version
de la page offline même après un nouveau déploiement.

**Valeur actuelle :** `revision: "3"`

---

## D-011 — Aucune photo de personne dans l'interface

**Décision :** Aucune image de personne n'est affichée ni stockée dans
l'application (membres, admins, etc.).

**Pourquoi :** Principe éthique non négociable du projet. Les profils membres
ont un nom, une catégorie et un rôle — pas de photo.

## D-012 — Jumu'ah : affichée toute la semaine, active uniquement le vendredi

**Décision :** La Jumu'ah est toujours présente dans le tableau des horaires,
mais grisée (`isInactive: true`) en dehors du vendredi. Le vendredi, elle
remplace Dhuhr à la même position dans la liste. L'heure de Dhuhr reste
affichée en note discrète pour ceux qui ne peuvent pas accomplir la Jumu'ah
en groupe (malades, voyageurs, prière à domicile).

**Pourquoi :** Anti-jahàla : supprimer la Jumu'ah en semaine ou l'heure de
Dhuhr le vendredi priverait les fidèles d'informations utiles. La transparence
prime sur la simplicité visuelle.

**Implémentation :** Logique dans `prayer-schedule-core.ts` →
`buildDailySchedule()`. Rendu dans `PrayerSchedule.tsx` → `PrayerRow` gère
l'état `isInactive`.

---

## D-013 — Domaine amanaconnect.org sur Cloudflare (domaine primaire)

**Décision :** Le domaine `amanaconnect.org` est géré sur Cloudflare avec les
DNS pointant vers Vercel. C'est le **domaine primaire** du projet.
`mosquee-platform.vercel.app` redirige en **307** vers `amanaconnect.org` —
les deux URLs ne sont pas canoniquement équivalentes.

**Pourquoi :** Nom de domaine professionnel pour les démonstrations terrain et
la crédibilité auprès des mosquées. Cloudflare offre le CDN et la protection
DDoS gratuitement.

**Configuration Vercel (vérifiée) :**
- `amanaconnect.org` → Production (domaine primaire)
- `mosquee-platform.vercel.app` → Redirect 307 vers `amanaconnect.org`

**Emails Resend :** Le domaine est configuré pour l'envoi d'emails via Resend
(enregistrements DNS SPF/DKIM validés). Actuellement en mode test (envoi
uniquement vers `abdallahmarly90@gmail.com`). Passage en production nécessite
la validation du compte Resend.

---

## Note — Commit 1476230 (intitulé trompeur)

Le commit `1476230` porte le titre "Tests E2E sur flux critiques" mais ne
contient pas de tests E2E au sens Playwright/Cypress (navigateur réel). Il
contient des mocks Vitest ajoutés aux tests unitaires existants pour neutraliser
le nouvel audit log. Le commit `8932038` corrige les lacunes réelles signalées :
pagination admin branchée, audit log superadmin complet, DECISIONS.md restauré.

## D-014 — Procédure de migration BDD : génération Drizzle + application manuelle

**Décision :** Les évolutions du schéma suivent ce workflow en deux étapes :
1. Modifier `src/db/schema.ts`
2. Générer le fichier SQL : `pnpm exec drizzle-kit generate --name="description"`
3. En local uniquement : `pnpm db:push` pour tester
4. En production : appliquer le SQL généré manuellement dans l'éditeur SQL Neon,
   **après** avoir créé une branche de secours Neon.

**Pourquoi pas `db:push` directement en production :**
`db:push` ne génère pas de fichier de migration versionné. Une évolution non
tracée est difficile à rejouer, à auditer ou à annuler. Le fichier SQL généré
est conservé dans `drizzle/` et versionné dans git — c'est la source de vérité.

**Ne jamais exécuter `pnpm db:seed` contre la production.**

**Migration initiale :** `drizzle/0000_initial_schema.sql` couvre l'état complet
du schéma au 27 juin 2026. Les migrations suivantes seront numérotées
`0001_...`, `0002_...`, etc.

## D-015 — Gestion des abonnements : statut et dates dans la table mosques

**Décision :** Les informations d'abonnement sont stockées directement dans la
table `mosques` (3 champs) plutôt que dans une table séparée.

**Champs :**
- `trial_ends_at` : date de fin de la période gratuite
- `paid_until` : date jusqu'à laquelle le service est payé (null = jamais payé)
- `subscription_status` : `trial` | `active` | `expired` | `suspended`

**Cycle de vie :**
```
Création mosquée → status='trial', trial_ends_at = now + 3 mois
                         ↓ (date dépassée)
                    status='expired' (calculé dynamiquement)
                         ↓ (super-admin enregistre un paiement)
                    status='active', paid_until = date + N mois
                         ↓ (paid_until dépassé)
                    status='expired'
```

**Pourquoi pas une table séparée :** anti-israf. À ce stade, une table séparée
avec historique des paiements serait prématurée. Un champ `paid_until` suffit.
L'historique est dans `audit_log` (action `subscription.renew`).

**Règles éthiques :**
- Anti-jahàla : la mosquée voit toujours son statut et la date d'expiration
- Anti-gharar : le panel admin montre un avertissement avant expiration (J-7)
- Les données ne sont jamais effacées — on suspend, jamais on supprime
- Pas de suspension automatique — le super-admin décide manuellement

---

## D-017 — Rôles granulaires : super_admin, support, billing

**Décision :** Le système de rôles est étendu pour supporter plusieurs niveaux
d'administration : `super_admin` (tous droits), `support` (lecture seule sur
toutes les mosquées), `billing` (accès aux infos d'abonnement), `admin` (droits
sur sa mosquée).

**Pourquoi :** Pour éviter le single point of failure d'un seul super-admin.
Permet la délégation des tâches (support technique, facturation) tout en
maintenant la séparation des responsabilités.

**Conséquence :** Nouveaux champs dans `users.role` et mise à jour de
`authorization.ts` avec les fonctions `isSupport()`, `isBilling()`,
`isAdminLevel()`.

---

## D-018 — MFA (TOTP) obligatoire pour super-admins

**Décision :** Les super-admins doivent activer l'authentification à deux facteurs
via TOTP (Google Authenticator, etc.) avant d'accéder aux fonctions sensibles.

**Pourquoi :** Sécurité critique pour les comptes avec accès total à la plateforme.
Un compte compromis = accès à toutes les données de toutes les mosquées.

**Implémentation :** Utilise `otpauth` pour la génération et vérification des codes.
Stocke le secret TOTP et les codes de récupération dans la table `users`.
Le MFA est optionnel par défaut mais fortement recommandé.

---

## D-019 — Procédure de récupération d'urgence pour super-admins

**Décision :** Les super-admins peuvent configurer un email d'urgence. En cas de
perte d'accès, une procédure de récupération envoie un lien temporaire (1h) à
cet email pour réinitialiser le mot de passe.

**Pourquoi :** Pour éviter le single point of failure. Si le super-admin perd ses
accès (oubli MFA, perte device), il doit pouvoir récupérer son compte sans
intervention manuelle en base de données.

**Conséquence :** Nouveaux champs `emergencyEmail` dans `users` et actions
`initiateEmergencyRecovery`, `completeEmergencyRecovery`.

---

## D-020 — Tests E2E avec Playwright pour flux critiques

**Décision :** Implémentation d'une suite de tests E2E avec Playwright pour les
flux critiques : inscription self-service, MFA, récupération d'urgence.

**Pourquoi :** Les tests unitaires Vitest ne suffisent pas pour valider les flux
complets de bout en bout. Les régressions sur les flux critiques sont inacceptables
pour une adoption de masse.

**Implémentation :** Playwright configuré avec Chromium, Firefox, WebKit. Tests
écrits dans `e2e/` directory. Exécution via `pnpm exec playwright test`.
