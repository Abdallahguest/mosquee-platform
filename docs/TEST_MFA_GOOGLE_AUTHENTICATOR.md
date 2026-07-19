# Guide de Test Manuel : MFA avec Google Authenticator

Ce guide explique comment tester manuellement le système MFA (Multi-Factor Authentication) avec Google Authenticator.

## Prérequis

- [ ] Migration BDD appliquée (`drizzle/0001_add_roles_mfa_emergency_recovery.sql`)
- [ ] Application démarrée localement : `pnpm dev`
- [ ] Un compte super-admin existant (ou en créer un)
- [ ] Google Authenticator installé sur votre téléphone (iOS/Android)

## Installation de Google Authenticator

### iOS
1. Allez dans l'App Store
2. Recherchez "Google Authenticator"
3. Téléchargez l'application officielle de Google

### Android
1. Allez dans Google Play Store
2. Recherchez "Google Authenticator"
3. Téléchargez l'application officielle de Google

## Scénario de Test : Setup MFA

### Étape 1 : Se Connecter en Super-Admin

1. Connectez-vous avec votre compte super-admin
2. Allez dans `/fr/admin/profile` (ou la page de profil)
3. Vérifiez que la section MFA s'affiche

### Étape 2 : Initier le Setup MFA

1. Cliquez sur le bouton "Activer MFA"
2. Vérifiez que l'interface de setup s'affiche avec 3 étapes

### Étape 3 : Scanner le QR Code

1. Ouvrez Google Authenticator sur votre téléphone
2. Appuyez sur le bouton "+" (ajouter)
3. Choisissez "Scanner un QR code"
4. Scannez le QR code affiché sur l'écran
5. Vérifiez qu'un nouveau compte "Amana Connect" apparaît dans Google Authenticator
6. Vérifiez qu'un code à 6 chiffres s'affiche et change toutes les 30 secondes

### Étape 4 : Sauvegarder les Codes de Récupération

1. Sur l'écran, vous verrez 10 codes de récupération
2. **IMPORTANT :** Sauvegardez ces codes dans un endroit sûr
   - Notez-les sur papier
   - Sauvegardez-les dans un gestionnaire de mots de passe
   - Ne les perdez jamais !
3. Chaque code ne peut être utilisé qu'une seule fois

### Étape 5 : Confirmer avec un Code TOTP

1. Regardez le code actuel dans Google Authenticator
2. Entrez ce code dans le champ "Code de vérification"
3. Cliquez sur "Activer MFA"
4. Vérifiez le message de succès : "MFA activé avec succès !"

### Étape 6 : Vérifier la Base de Données

Connectez-vous à votre base de données et vérifiez :

```sql
SELECT id, email, totp_enabled, totp_secret IS NOT NULL as has_secret, 
       recovery_codes IS NOT NULL as has_recovery_codes
FROM users 
WHERE email = 'votre-super-admin@email.com';
```

Attendu :
- `totp_enabled = true`
- `has_secret = true`
- `has_recovery_codes = true`

## Scénario de Test : Connexion avec MFA

### Étape 1 : Se Déconnecter

1. Cliquez sur "Se déconnecter" dans le menu
2. Vérifiez que vous êtes redirigé vers `/login`

### Étape 2 : Se Connecter avec MFA

1. Entrez votre email et mot de passe
2. Cliquez sur "Se connecter"
3. **Note :** Pour l'instant, MFA n'est pas intégré dans le flux de connexion standard
4. MFA est configuré mais la vérification à la connexion doit être implémentée

### Étape 3 : Vérification Manuelle du Code

Pour tester que le code fonctionne correctement :

1. Ouvrez Google Authenticator
2. Notez le code actuel
3. Utilisez la fonction de vérification dans votre code :
```typescript
import { verifyTOTPCode } from "@/lib/mfa"

const isValid = verifyTOTPCode(secret, code)
console.log("Code valide:", isValid)
```

## Scénario de Test : Codes de Récupération

### Étape 1 : Simuler une Perte d'Accès

1. Supprimez le compte de Google Authenticator
2. Simulez une situation où vous n'avez plus accès à votre téléphone

### Étape 2 : Utiliser un Code de Récupération

1. Utilisez un des codes de récupération sauvegardés
2. Le code doit être entré dans le champ de vérification MFA
3. Après utilisation, le code est invalidé

### Étape 3 : Vérifier en Base de Données

```sql
SELECT recovery_codes FROM users WHERE email = 'votre-super-admin@email.com';
```

Vérifiez que le code utilisé a été supprimé de la liste.

## Scénario de Test : Désactivation MFA

### Étape 1 : Désactiver MFA

1. Allez dans `/fr/admin/profile`
2. Cliquez sur "Désactiver MFA"
3. Confirmez la désactivation
4. Vérifiez le message de succès

### Étape 2 : Vérifier la Base de Données

```sql
SELECT totp_enabled, totp_secret, recovery_codes 
FROM users 
WHERE email = 'votre-super-admin@email.com';
```

Attendu :
- `totp_enabled = false`
- `totp_secret = NULL`
- `recovery_codes = NULL`

### Étape 3 : Supprimer le Compte Google Authenticator

1. Ouvrez Google Authenticator
2. Appuyez longuement sur le compte "Amana Connect"
3. Supprimez-le

## Scénario de Test : Email d'Urgence

### Étape 1 : Configurer l'Email d'Urgence

1. Allez dans `/fr/admin/profile`
2. Entrez un email d'urgence différent de votre email principal
3. Cliquez sur "Mettre à jour"
4. Vérifiez le message de succès

### Étape 2 : Vérifier la Base de Données

```sql
SELECT emergency_email FROM users WHERE email = 'votre-super-admin@email.com';
```

Vérifiez que l'email d'urgence est bien enregistré.

### Étape 3 : Tester la Récupération

1. Allez sur `/fr/emergency-recovery`
2. Entrez votre email principal
3. Cliquez sur "Envoyer le lien de récupération"
4. Vérifiez que l'email est envoyé à l'email d'urgence

## Dépannage

### QR Code Ne Se Scanne Pas

**Problème :** Google Authenticator ne peut pas scanner le QR code.

**Solutions :**
1. Vérifiez que l'URL du QR code est correcte
2. Vérifiez que le secret TOTP est bien généré
3. Essayez d'entrer manuellement le secret (option "Entrer une clé fournie" dans Google Authenticator)

### Code TOTP Invalide

**Problème :** Le code TOTP est toujours refusé.

**Solutions :**
1. Vérifiez que l'horloge de votre téléphone est synchronisée
2. Vérifiez que le secret est correctement stocké en base
3. Vérifiez que la vérification utilise la bonne fenêtre de temps (±30 secondes)

### Codes de Récupération Perdus

**Problème :** Vous avez perdu vos codes de récupération.

**Solutions :**
1. Désactivez MFA
2. Réactivez MFA pour générer de nouveaux codes
3. Sauvegardez les nouveaux codes immédiatement

### Email d'Urgence Non Reçu

**Problème :** L'email de récupération n'arrive pas.

**Solutions :**
1. Vérifiez que Resend est configuré
2. Vérifiez que l'email d'urgence est correct
3. Vérifiez les logs Resend

## Tests Automatisés

Les tests E2E Playwright couvrent également ce flux :

```bash
pnpm exec playwright test e2e/mfa.spec.ts
```

Pour voir les résultats :
```bash
pnpm exec playwright show-report
```

## Tests Unitaires

Les fonctions MFA peuvent être testées unitairement :

```typescript
import { generateTOTPSecret, verifyTOTPCode, verifyRecoveryCode } from "@/lib/mfa"

// Test génération
const { secret, qrCodeUrl, recoveryCodes } = generateTOTPSecret("test@example.com")
console.log("Secret:", secret)
console.log("QR Code URL:", qrCodeUrl)
console.log("Recovery Codes:", recoveryCodes)

// Test vérification (nécessite un vrai code TOTP)
const isValid = verifyTOTPCode(secret, "123456")
console.log("Code valide:", isValid)

// Test codes de récupération
const result = verifyRecoveryCode(JSON.stringify(recoveryCodes), "CODE1")
console.log("Code valide:", result.valid)
console.log("Codes restants:", result.remainingCodes)
```

## Checklist de Validation

- [ ] Google Authenticator installé
- [ ] Setup MFA fonctionne
- [ ] QR code se scanne correctement
- [ ] Codes TOTP sont valides
- [ ] Codes de récupération sont générés
- [ ] Codes de récupération fonctionnent
- [ ] Codes de récupération sont invalidés après utilisation
- [ ] Désactivation MFA fonctionne
- [ ] Email d'urgence se configure
- [ ] Récupération d'urgence envoie l'email
- [ ] Base de données mise à jour correctement

## Sécurité

### Bonnes Pratiques

1. **Sauvegardez les codes de récupération** dans un endroit sûr
2. **Utilisez un email d'urgence différent** de votre email principal
3. **Ne partagez jamais vos codes** avec quelqu'un d'autre
4. **Activez MFA sur tous les comptes super-admins**
5. **Testez régulièrement** la récupération d'urgence

### Risques

- **Perte du téléphone + codes de récupération** = Blocage permanent
- **Partage des codes** = Compromission du compte
- **Email d'urgence compromis** = Récupération non autorisée possible

## Intégration dans le Flux de Connexion

Pour l'instant, MFA est configuré mais pas intégré dans le flux de connexion standard. Pour l'intégrer :

1. Modifier le flux de connexion pour demander le code TOTP après le mot de passe
2. Ajouter une page intermédiaire `/login/mfa`
3. Vérifier le code TOTP avant d'accorder l'accès
4. Permettre l'utilisation des codes de récupération

Ceci peut être implémenté dans une phase ultérieure.

## Notes pour le Déploiement

Avant de déployer en production :

1. **Formation des super-admins** : Expliquer comment utiliser Google Authenticator
2. **Documentation** : Fournir ce guide aux super-admins
3. **Procédure de récupération** : S'assurer que la procédure d'urgence est testée
4. **Monitoring** : Surveiller les échecs de vérification MFA

## Support

En cas de problème :
- Vérifiez les logs du serveur
- Vérifiez la synchronisation de l'horloge du téléphone
- Consultez la documentation otpauth : https://github.com/hectorm/otpauth
