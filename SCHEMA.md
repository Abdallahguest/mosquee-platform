# Schéma de base de données — Amana Connect

> Source de vérité : `src/db/schema.ts`
> Base : PostgreSQL via Neon (région eu-west-2, projet `orange-breeze-54598528`)
> ORM : Drizzle ORM
> Migration versionnée : `drizzle/0000_initial_schema.sql`

---

## Vue d'ensemble

```
mosques ──< mosque_admins >── users
mosques ──< announcements
mosques ──< events
mosques ──< mosque_members
mosques ──< audit_log (nullable)
users   ──< audit_log (nullable)

Better-Auth : session, account, verification, rate_limit
```

Toutes les FK enfants de `mosques` ont `ON DELETE CASCADE`.

---

## Tables métier

### `mosques`

Table centrale du système. Chaque mosquée est un tenant isolé.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | serial | PK | Identifiant auto-incrémenté |
| `slug` | varchar(100) | NOT NULL, UNIQUE | Identifiant URL (`masdjid-taqwa`) |
| `name` | varchar(200) | NOT NULL | Nom principal |
| `name_fr` | varchar(200) | nullable | Nom officiel en français (optionnel) |
| `name_en` | varchar(200) | nullable | Nom officiel en anglais (optionnel) |
| `name_ar` | varchar(200) | nullable | Nom officiel en arabe (optionnel) |
| `city` | varchar(100) | NOT NULL | Ville |
| `country` | varchar(100) | NOT NULL | Pays |
| `commune` | varchar(100) | nullable | Commune (précision optionnelle) |
| `quartier` | varchar(100) | nullable | Quartier (précision optionnelle) |
| `secteur` | varchar(100) | nullable | Secteur (précision optionnelle) |
| `latitude` | float8 | NOT NULL | Coordonnée GPS |
| `longitude` | float8 | NOT NULL | Coordonnée GPS |
| `timezone` | varchar(100) | NOT NULL, default `Africa/Conakry` | Fuseau horaire IANA |
| `is_verified` | boolean | NOT NULL, default false | Vérifiée par le super-admin |
| `donation_url` | varchar(500) | nullable | Lien de don externe |
| `contact_email` | varchar(255) | nullable | Email de contact public |
| `contact_phone` | varchar(50) | nullable | Téléphone de contact public |
| `orange_money_number` | varchar(20) | nullable | Numéro Orange Money (format `6XXXXXXXX`) |
| `welcome_message` | text | nullable | Message affiché en haut de la page publique |
| `footer_text` | text | nullable | Texte affiché dans le pied de page public |
| `fajr_adhan` | varchar(5) | nullable | Format `HH:MM`. null → affiche "—" |
| `fajr_iqama` | varchar(5) | nullable | Idem |
| `dhuhr_adhan` | varchar(5) | nullable | Idem |
| `dhuhr_iqama` | varchar(5) | nullable | Idem |
| `asr_adhan` | varchar(5) | nullable | Idem |
| `asr_iqama` | varchar(5) | nullable | Idem |
| `maghrib_adhan` | varchar(5) | nullable | Idem |
| `maghrib_iqama` | varchar(5) | nullable | Idem |
| `isha_adhan` | varchar(5) | nullable | Idem |
| `isha_iqama` | varchar(5) | nullable | Idem |
| `jumua_adhan` | varchar(5) | nullable | Idem |
| `jumua_iqama` | varchar(5) | nullable | Idem |
| `created_at` | timestamp | NOT NULL, default now() | |

> Les horaires sont en **saisie manuelle** (source de vérité). Le calcul MWL via `adhan-js` n'est qu'une suggestion optionnelle côté admin. Voir D-001 dans `DECISIONS.md`.

---

### `users`

Géré par Better-Auth. Champ `role` ajouté pour les besoins métier.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | varchar(255) | PK | UUID géré par Better-Auth |
| `name` | varchar(200) | NOT NULL | Nom complet |
| `email` | varchar(255) | NOT NULL, UNIQUE | Email de connexion |
| `email_verified` | boolean | NOT NULL, default false | Vérification email |
| `image` | text | nullable | Non utilisé (aucune photo) |
| `role` | text | NOT NULL, default `admin` | `admin` ou `super_admin` |
| `created_at` | timestamp | NOT NULL | |
| `updated_at` | timestamp | NOT NULL | |

---

### `mosque_admins`

Table de liaison N:N entre mosquées et admins. Un admin peut gérer plusieurs mosquées.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | serial | PK | |
| `mosque_id` | integer | NOT NULL, FK → mosques(id) CASCADE | |
| `user_id` | varchar(255) | NOT NULL, FK → users(id) CASCADE | |
| `created_at` | timestamp | NOT NULL | |

Contrainte d'unicité : `(mosque_id, user_id)`.

---

### `announcements`

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | serial | PK | |
| `mosque_id` | integer | NOT NULL, FK → mosques(id) CASCADE | |
| `title` | varchar(100) | NOT NULL | |
| `content` | text | NOT NULL | Supporte Markdown (sanitisé par DOMPurify) |
| `author_id` | varchar(255) | NOT NULL, FK → users(id) | |
| `published_at` | timestamp | nullable | Date de première publication |
| `expires_at` | timestamp | nullable | Dépublication automatique à cette date |
| `is_published` | boolean | NOT NULL, default false | |
| `is_pinned` | boolean | NOT NULL, default false | Épinglée en tête de liste |
| `audio_url` | varchar(500) | nullable | Lien audio externe (jamais de fichier stocké) |
| `created_at` | timestamp | NOT NULL | |

**Index :** `mosque_id`, `is_published`, `published_at`

---

### `events`

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | serial | PK | |
| `mosque_id` | integer | NOT NULL, FK → mosques(id) CASCADE | |
| `title` | varchar(100) | NOT NULL | |
| `description` | text | nullable | |
| `location` | varchar(200) | NOT NULL, default `À la mosquée` | |
| `start_at` | timestamp | NOT NULL | |
| `end_at` | timestamp | nullable | |
| `is_published` | boolean | NOT NULL, default false | |
| `audio_url` | varchar(500) | nullable | Lien audio externe |

**Index :** `mosque_id`, `is_published`, `start_at`

---

### `mosque_members`

Liste privée des membres de l'équipe. Jamais exposée publiquement (consentement requis). Aucune photo.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | serial | PK | |
| `mosque_id` | integer | NOT NULL, FK → mosques(id) CASCADE | |
| `name` | varchar(200) | NOT NULL | |
| `category` | varchar(20) | NOT NULL | `imam` \| `sage` \| `conseiller` \| `equipe` |
| `role` | varchar(200) | nullable | Précision libre optionnelle |
| `sort_order` | integer | NOT NULL, default 0 | Ordre d'affichage manuel |
| `created_at` | timestamp | NOT NULL | |

---

### `audit_log`

Journal d'activité. Lecture seule côté applicatif.

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | serial | PK | |
| `user_id` | varchar(255) | nullable | Qui a agi (null = action système) |
| `mosque_id` | integer | nullable | Mosquée concernée (null = action globale) |
| `action` | varchar(100) | NOT NULL | Ex : `announcement.create`, `auth.sign_in_failed` |
| `target_id` | varchar(100) | nullable | Ex : `announcement:42`, `event:7` |
| `details` | text | nullable | Informations complémentaires — jamais de données sensibles |
| `created_at` | timestamp | NOT NULL | |

---

## Tables Better-Auth

Gérées automatiquement par Better-Auth via l'adaptateur Drizzle.

| Table | Rôle |
|---|---|
| `session` | Sessions actives (7 jours, cookie cache 5 min) |
| `account` | Liens d'authentification (email+password) |
| `verification` | Tokens de vérification email et reset password |
| `rate_limit` | Compteurs anti-brute-force en base |

---

## Règles de cascade

Supprimer une mosquée supprime en cascade :
- Toutes ses annonces (`announcements`)
- Tous ses événements (`events`)
- Tous ses membres (`mosque_members`)
- Tous ses liens admin (`mosque_admins`)

Les entrées `audit_log` associées **ne sont pas supprimées** (FK nullable, pas de cascade) — conservation intentionnelle pour l'historique.

---

## Migrations

Fichier de migration initial : `drizzle/0000_initial_schema.sql`
Journal Drizzle : `drizzle/meta/_journal.json`

Pour générer une nouvelle migration après modification du schéma :
```bash
pnpm exec drizzle-kit generate --name="description_du_changement"
```

Pour appliquer en base de développement local :
```bash
pnpm db:push
```

En production : appliquer le SQL généré manuellement dans l'éditeur SQL de Neon, après avoir créé une branche de secours.
