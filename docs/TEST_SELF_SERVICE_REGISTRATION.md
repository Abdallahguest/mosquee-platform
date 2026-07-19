# Guide de Test Manuel : Inscription Self-Service

Ce guide explique comment tester manuellement le flux d'inscription self-service (Modèle C hybride).

## Prérequis

- [ ] Migration BDD appliquée (`drizzle/0001_add_roles_mfa_emergency_recovery.sql`)
- [ ] Resend configuré en mode production (ou en mode test avec votre email)
- [ ] Application démarrée localement : `pnpm dev`
- [ ] Base de données locale configurée

## Scénario de Test : Inscription Réussie

### Étape 1 : Accéder à la Page d'Inscription

1. Ouvrez votre navigateur sur `http://localhost:3000/fr/register`
2. Vérifiez que le formulaire d'inscription s'affiche
3. Vérifiez les éléments suivants :
   - Titre : "Créer un compte pour votre mosquée"
   - Section "Informations personnelles"
   - Section "Informations de la mosquée"
   - Message sur la période d'essai gratuite

### Étape 2 : Remplir le Formulaire

Remplissez le formulaire avec les données de test :

**Informations personnelles :**
- Nom : `Test User`
- Email : `test+${Date.now()}@example.com` (utilisez un timestamp pour éviter les doublons)
- Mot de passe : `TestPassword123`

**Informations de la mosquée :**
- Nom de la mosquée : `Mosquée Test`
- Ville : `Conakry`
- Pays : `Guinée`

### Étape 3 : Soumettre le Formulaire

1. Cliquez sur le bouton "Créer mon compte"
2. Vérifiez le message de succès :
   - "Inscription réussie ! Vérifiez votre email pour activer votre compte."
3. Attendez la redirection automatique vers `/login?registered=true`

### Étape 4 : Vérifier la Base de Données

Connectez-vous à votre base de données locale et vérifiez :

```sql
-- Vérifier l'utilisateur créé
SELECT id, name, email, email_verified, role, is_pending_setup 
FROM users 
WHERE email LIKE 'test+%@example.com' 
ORDER BY created_at DESC 
LIMIT 1;
```

Attendu :
- `email_verified = false`
- `role = 'admin'`
- `is_pending_setup = true`

```sql
-- Vérifier la mosquée créée
SELECT id, slug, name, city, country, subscription_status, trial_ends_at 
FROM mosques 
ORDER BY created_at DESC 
LIMIT 1;
```

Attendu :
- `subscription_status = 'trial'`
- `trial_ends_at = date actuelle + 3 mois`

```sql
-- Vérifier la liaison admin-mosquée
SELECT * FROM mosque_admins 
ORDER BY created_at DESC 
LIMIT 1;
```

Attendu :
- Une ligne liant l'utilisateur et la mosquée

### Étape 5 : Vérifier l'Email de Vérification

1. Allez dans votre boîte de réception email
2. Cherchez l'email de Resend avec le sujet : "Verify your email"
3. Cliquez sur le lien de vérification
4. Vous serez redirigé vers l'application

### Étape 6 : Se Connecter

1. Allez sur `http://localhost:3000/fr/login`
2. Entrez l'email et le mot de passe
3. Cliquez sur "Se connecter"
4. Vérifiez que vous êtes redirigé vers `/fr/admin`

### Étape 7 : Vérifier le Statut du Compte

1. Dans le panel admin, vérifiez que vous avez accès à votre mosquée
2. Vérifiez que la bannière de période d'essai s'affiche
3. Vérifiez que `is_pending_setup` est maintenant `false` en base de données

## Scénario de Test : Validation des Erreurs

### Test 1 : Email Déjà Existant

1. Essayez de vous inscrire avec un email déjà utilisé
2. Vérifiez le message d'erreur : "Un compte existe déjà avec cet email."

### Test 2 : Mot de Passe Trop Court

1. Entrez un mot de passe de moins de 8 caractères
2. Vérifiez le message d'erreur : "8 caractères minimum"

### Test 3 : Champs Requis Manquants

1. Soumettez le formulaire sans remplir les champs requis
2. Vérifiez les messages de validation pour chaque champ

### Test 4 : Email Invalide

1. Entrez un email invalide (ex: "invalid-email")
2. Vérifiez le message d'erreur : "Email invalide"

## Scénario de Test : Slug Unique

### Test 1 : Mosquée avec Même Nom

1. Créez une mosquée nommée "Mosquée Test"
2. Essayez de créer une deuxième mosquée nommée "Mosquée Test"
3. Vérifiez que le slug est automatiquement incrémenté :
   - Premier : `mosquee-test`
   - Deuxième : `mosquee-test-1`

## Scénario de Test : Période d'Essai

### Vérification de la Date de Fin

1. Après l'inscription, vérifiez en base de données :
```sql
SELECT trial_ends_at FROM mosques ORDER BY created_at DESC LIMIT 1;
```
2. Vérifiez que la date est bien 3 mois dans le futur

### Vérification du Statut

1. Dans le panel admin, vérifiez la bannière d'essai
2. Vérifiez le message : "Période gratuite : X jour(s) restant(s)"

## Scénario de Test : Workflow Super-Admin

### Validation par Super-Admin

1. Connectez-vous en tant que super-admin
2. Allez dans `/fr/super-admin/mosques`
3. Vérifiez que la mosquée créée apparaît
4. Vérifiez son statut : `trial`
5. Vérifiez que vous pouvez la modifier/supprimer

## Dépannage

### Email Non Reçu

**Problème :** L'email de vérification n'arrive pas.

**Solutions :**
1. Vérifiez que Resend est configuré
2. Vérifiez les logs Resend
3. Vérifiez le dossier spam
4. En mode test Resend, l'email n'est envoyé qu'à l'adresse du propriétaire du compte

### Erreur "Un compte existe déjà"

**Problème :** L'email est déjà utilisé.

**Solutions :**
1. Supprimez l'utilisateur en base de données
2. Ou utilisez un email différent (ajoutez un timestamp)

### Erreur de Slug

**Problème :** Le slug n'est pas unique.

**Solutions :**
1. Le système incrémente automatiquement le slug
2. Vérifiez que la logique fonctionne en créant plusieurs mosquées avec le même nom

### Redirection Incorrecte

**Problème :** Après inscription, redirection incorrecte.

**Solutions :**
1. Vérifiez que `NEXT_PUBLIC_APP_URL` est correctement configuré
2. Vérifiez les logs du serveur

## Checklist de Validation

- [ ] Formulaire d'inscription s'affiche correctement
- [ ] Validation des champs fonctionne
- [ ] Inscription crée l'utilisateur en base
- [ ] Inscription crée la mosquée en base
- [ ] Inscription crée la liaison admin-mosquée
- [ ] Email de vérification est envoyé
- [ ] Lien de vérification active le compte
- [ ] Connexion fonctionne après vérification
- [ ] Période d'essai est correctement configurée
- [ ] Slug unique fonctionne
- [ ] Super-admin peut voir la mosquée
- [ ] Messages d'erreur sont clairs

## Tests Automatisés

Les tests E2E Playwright couvrent également ce flux :

```bash
pnpm exec playwright test e2e/self-service-registration.spec.ts
```

Pour voir les résultats :
```bash
pnpm exec playwright show-report
```

## Notes pour le Déploiement

Avant de déployer en production :

1. **Resend en mode production** : Suivez le guide `docs/RESEND_PRODUCTION_SETUP.md`
2. **Domaine vérifié** : Assurez-vous que le domaine d'envoi est vérifié dans Resend
3. **Limites de volume** : Configurez les limites dans Resend pour éviter les abus
4. **Monitoring** : Surveillez les taux de bounce et de spam

## Support

En cas de problème :
- Vérifiez les logs du serveur
- Vérifiez les logs Resend
- Consultez la documentation Resend : https://resend.com/docs
