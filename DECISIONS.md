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

## D-003 — Modèle B : comptes créés par le super-admin

**Décision :** L'inscription publique est désactivée (`disableSignUp: true`
dans Better-Auth + page `/register` remplacée par un message). Les comptes sont
créés uniquement par le super-admin, qui les marque vérifiés directement.

**Pourquoi :** Resend est en mode test (envoi uniquement vers l'adresse du
développeur). Une inscription libre créerait des comptes non vérifiables et des
comptes orphelins sans mosquée assignée.

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

## D-007 — Pas d'upload de fichiers

**Décision :** Les liens audio sont des URLs externes (Google Drive, etc.),
pas des fichiers uploadés sur la plateforme.

**Pourquoi :** Principe anti-israf. Stocker des fichiers audio nécessiterait
R2/S3, une politique de taille, une modération. Le besoin réel est de partager
un lien — pas de stocker des fichiers.

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

## D-013 — Domaine amanaconnect.org sur Cloudflare

**Décision :** Le domaine `amanaconnect.org` est géré sur Cloudflare avec les
DNS pointant vers Vercel. Le projet est accessible via `amanaconnect.org` et
`mosquee-platform.vercel.app` (alias Vercel).

**Pourquoi :** Nom de domaine professionnel pour les démonstrations terrain et
la crédibilité auprès des mosquées. Cloudflare offre le CDN et la protection
DDoS gratuitement.

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
