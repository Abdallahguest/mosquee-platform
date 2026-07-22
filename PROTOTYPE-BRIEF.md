# Script — Prototype Amana Connect pour Claude (Design / Artifact)

> Copie-colle **tout le bloc ci-dessous** dans une nouvelle conversation Claude (claude.ai).
> Claude produira un **artifact HTML unique, cliquable, mobile-first**, couvrant tous les écrans.
> Après le premier rendu, tu peux itérer : « change la langue en arabe », « montre l'écran super-admin abonnements », etc.

---

════════════════════════════════════════════════════════════════════
DÉBUT DU PROMPT À COLLER
════════════════════════════════════════════════════════════════════

# Rôle
Tu es designer produit senior. Construis un **prototype interactif complet, haute-fidélité** de l'application **Amana Connect** (marque produit : **Mihrab**), dans **un seul artifact HTML autonome** (CSS + JS inline, aucune ressource externe, emoji et SVG inline uniquement). **Mobile-first.** Le prototype doit être **réellement cliquable** : cliquer sur la navigation ou les boutons change d'écran (routing interne en JS, pas de backend, données fictives en dur).

# Le produit en une phrase
Amana Connect est une plateforme SaaS multi-tenant **100 % halal** de gestion de mosquées : chaque mosquée a une page publique (horaires de prière, annonces, événements, membres, dons), un espace admin pour gérer son contenu, et au-dessus un super-admin qui crée les mosquées et gère les abonnements. Contexte : Guinée (Conakry), français par défaut, réseau instable → sobre et rapide.

# Contraintes doctrinales — NON négociables, visibles dans le design
- **Aucune photo de personne, jamais.** Les membres sont représentés par une icône neutre ou leurs initiales dans un cercle vert. Pas d'avatars photo.
- **Aucune commission sur les dons ou la zakat.** Afficher visiblement, près des dons : « La plateforme ne traite et ne touche aucun argent. »
- **Anti-gharar (pas d'incertitude trompeuse)** : toute donnée hors-ligne ou en cache porte sa date (« Dernières données connues : … »). Si l'abonnement d'une mosquée est expiré/suspendu, un bandeau ambre discret prévient sur la page publique.
- **Anti-jahàla (transparence)** : le statut d'abonnement est toujours visible pour l'admin, avec la date d'expiration. Messages explicatifs, jamais d'action destructive sans décompte/confirmation.
- **Anti-israf (sobriété)** : interface épurée, pas de fioritures, pas d'animations gratuites.
- **Sans riba** : aucune notion d'intérêt, de dette ou de pénalité de retard. Après expiration, l'espace admin est bloqué mais **les données sont conservées** (jamais supprimées).

# Design system EXACT (à respecter au pixel près)
**Couleurs**
- Primaire mosquée/public/admin : vert `#15803d` (green-700), hover `#166534` (green-800)
- Navigation admin : fond vert foncé `#166534`
- Super-admin (réservé, ne jamais mélanger avec le vert) : fond nav indigo `#26215C`, accent/lien actif `#534AB7`
- Fond global des pages : `#f9fafb` (gray-50)
- Cartes / formulaires : blanc `#ffffff`, bordure `#e5e7eb` (gray-200), coins `rounded-2xl` (16px)
- Orange Money (bouton USSD uniquement) : orange `#f97316`
- Onboarding / trial : fond `amber-50` `#fffbeb`, bordure `amber-200`
- Succès : fond `green-50`, bordure `green-200`, texte `green-800`
- Erreur : rouge destructif

**Typographie** : police sans-serif type « Geist » pour FR/EN (fallback system-ui) ; pour l'arabe, « Noto Sans Arabic ». Titres semi-bold, corps `text-sm`.

**Mise en page**
- Largeur max : page publique `max-w-lg` (~512px), dashboard admin `max-w-2xl`, listes `max-w-4xl`. Comme c'est mobile-first, centrer dans un **cadre de téléphone** (mockup ~390px de large) au milieu de l'écran.
- Padding : public `px-6 py-6`, admin `px-6 py-8`
- Cartes : `bg-white border border-gray-200 rounded-2xl` + ombre légère
- États vides : gros emoji (5xl) + titre `font-medium` + description grise, centrés

**Accessibilité** : contrastes AA, focus visibles (anneau vert), emojis décoratifs `aria-hidden`.

**Internationalisation** : 3 langues FR / EN / AR. Prévoir un **sélecteur de langue** en haut. En arabe, tout passe en **RTL** (`dir="rtl"`), sauf les champs email/téléphone/numéros qui restent LTR. Fournir au minimum le contenu FR complet + une démonstration RTL en AR sur la page publique.

# Rôles et code couleur (strict)
1. **Public** (vert) — visiteur/fidèle, aucune connexion.
2. **Admin** (vert, nav vert foncé) — gère UNIQUEMENT le contenu de SA mosquée.
3. **Super-admin** (indigo `#26215C`) — crée les mosquées et les comptes, gère les abonnements et paiements.
Un sélecteur global « Voir en tant que : Public / Admin / Super-admin » permet de basculer entre les trois univers du prototype.

# ÉCRANS À PRODUIRE (avec contenu réaliste, tous cliquables)

## A. Espace PUBLIC (vert) — mosquée « Mosquée TAQWA »
1. **Page mosquée** (`/m/taqwa`) :
   - En-tête : nom « Mosquée TAQWA », localisation « Conakry, Ratoma, Kipé », badge « ✓ Vérifiée », date du jour.
   - Message de bienvenue (encadré vert) : « Qu'Allah bénisse votre visite. »
   - **Tableau des horaires de prière** : 6 lignes (Fajr, Dhuhr, Asr, Maghrib, Isha, Jumu'ah), 2 colonnes Adhan / Iqama. **Compte à rebours** vers la prochaine prière en haut (« Prochaine prière : Asr dans 1 h 12 »). **Règle Jumu'ah** : le vendredi, la Jumu'ah remplace Dhuhr à la même position, avec une note discrète conservant l'heure de Dhuhr ; les autres jours, Jumu'ah est affichée mais grisée.
   - **Annonces** (cartes) : 2 annonces, dont une épinglée « 📌 Collecte pour la toiture » et une avec un **lecteur audio** (barre de lecture stylisée).
   - **Événements** : 1 événement à venir « Conférence : Les mérites du Ramadan » + lien « voir tout / archive ».
   - **Pied de page** : contact (email/téléphone), **dons Orange Money** : numéro affiché en clair `6XX XX XX XX`, bouton `tel:`, **bouton USSD orange** `*144*1*1*6XXXXXXXX#`, bouton « copier », et la mention « La plateforme ne traite et ne touche aucun argent ». Bouton « Faire un don (lien externe) » + « Guide d'utilisation (PDF) ». Slogan : « Plateforme respectueuse · sans intérêt ni tromperie · rien de caché ».
2. **Liste des annonces** (`/m/taqwa/announcements`) — cartes paginées.
3. **Détail d'une annonce** — titre, date, contenu, lecteur audio.
4. **Liste des événements** — « À venir » + « Archive des passés ».
5. **Détail d'un événement** — titre, date/heure, lieu, description.
6. **Page hors-ligne** (`/offline`) — « Vous êtes hors connexion » + dernières données connues **datées** (horaires en cache).
7. Montre **le bandeau ambre « informations susceptibles de ne plus être à jour »** sur une variante où l'abonnement est expiré.

## B. AUTHENTIFICATION
8. **Connexion** (`/login`) — email + mot de passe, bouton vert, lien « mot de passe oublié ».
9. **Inscription désactivée** (`/register`) — message : « Les comptes sont créés par l'administrateur. » + bouton « Se connecter » (Modèle B : pas d'inscription publique).
10. **Mot de passe oublié** — champ email + confirmation d'envoi.

## C. Espace ADMIN (vert, nav vert foncé) — admin de « Mosquée TAQWA »
11. **Tableau de bord** (`/admin`) : cartes de synthèse (annonces publiées, événements à venir, membres), **badge d'abonnement** (ex. « Essai gratuit — expire dans 47 jours »), raccourcis.
12. **Horaires de prière** (`/admin` éditeur) : 12 champs (Adhan + Iqama × 6), **bouton « Suggérer » (calcul astronomique adhan)** qui pré-remplit sans écraser la décision de l'imam, sauvegarde. Note : « la saisie manuelle prime ; le calcul n'est qu'une aide ».
13. **Annonces** — liste + boutons publier/dépublier, épingler, éditer, supprimer (avec confirmation).
14. **Créer / éditer une annonce** — titre, contenu, date d'expiration, cases « publier / épingler », et **enregistreur audio** : bouton micro (« Enregistrer un message vocal ») OU « Choisir un fichier » ; barre de progression, max 5 Mo, formats audio. Sauvegarde de brouillon automatique (indicateur « Brouillon enregistré »).
15. **Événements** — liste + créer/éditer (titre, date/heure début, lieu, description, publier).
16. **Membres** — liste par catégorie (Imam, Sages, Conseillers, Équipe), **sans photo** (initiales dans un cercle vert). Ajouter/éditer : nom, catégorie, rôle libre, ordre. Mention « Liste non publique — affichée seulement avec l'accord des personnes ».
17. **Paramètres de la mosquée** — nom (+ noms FR/EN/AR), ville/commune/quartier, numéro Orange Money (validation : 9 chiffres, commence par 6), lien de don, email/téléphone de contact, message d'accueil, texte de pied de page, téléchargement des guides PDF.
18. **Profil** (`/admin/profile`) — changer son nom ; changer son mot de passe (ancien + nouveau + confirmation).
19. **Journal d'activité** (`/admin/activity`) — liste horodatée des actions de la mosquée (création annonce, mise à jour horaires, connexions…).
20. **Abonnement expiré** (`/admin/subscription-expired`) — écran de blocage : « Votre période d'accès est terminée. Vos données sont conservées. » + **bouton WhatsApp de rappel pré-rédigé** pour contacter l'admin, message expliquant qu'aucune donnée n'est perdue.

## D. Espace SUPER-ADMIN (indigo `#26215C`)
21. **Tableau de bord** (`/super-admin`) — statistiques : nb mosquées (dont vérifiées), nb comptes, nb annonces/événements, revenus récents.
22. **Mosquées** (`/super-admin/mosques`) — liste avec statut d'abonnement coloré (trial/active/expiring/expired/suspended).
23. **Créer / éditer une mosquée** — slug, nom, localisation, coordonnées GPS, fuseau, Orange Money, contacts, « vérifiée ».
24. **Admins d'une mosquée** — assigner/retirer des comptes admin à une mosquée.
25. **Comptes utilisateurs** (`/super-admin/users`) — liste ; créer un compte (nom, email, mot de passe) ; éditer ; réinitialiser mot de passe ; supprimer (avec règles : pas d'auto-suppression, pas d'action sur un autre super-admin). Montre ces garde-fous en messages d'aide.
26. **Abonnements & paiements** (`/super-admin/subscriptions`) — pour chaque mosquée : statut, dates (essai/payé jusqu'à), bouton **« Enregistrer un paiement »** (montant GNF, nombre de mois, méthode espèces/Orange Money, note), **suspendre / réactiver**. Tableau de l'historique des paiements (mosquée, montant, période, méthode, date). Rappel : prix indicatif **40 000 GNF/mois**, aucune suspension automatique (décision humaine).
27. **Activité globale** (`/super-admin/activity`) — journal de toutes les mosquées, regroupé par mosquée.
28. **Santé** (`/super-admin/health`) — alertes : mosquées sans horaires, sans annonces, dernière connexion admin, inactivité > 14 jours.
29. **Sélecteur de mosquée** (`/admin/select-mosque`) — le super-admin choisit quelle mosquée gérer dans l'espace admin.

# Détails de comportement à simuler (au moins visuellement)
- Compte à rebours prochaine prière (peut être statique ou animé simple).
- 5 statuts d'abonnement avec badges de couleur : `Essai` (ambre), `Actif` (vert), `Expire bientôt J-7` (ambre foncé), `Expiré` (rouge), `Suspendu` (gris).
- Lecteur audio stylisé (bouton play, barre, durée).
- Bascule de langue FR/EN/AR avec passage RTL en arabe sur la page publique.
- États vides élégants quand une liste est vide.
- Bannière sticky « hors-ligne » quand on ouvre l'écran offline.

# Données de démonstration (à utiliser partout, cohérentes)
- **Mosquée** : « Mosquée TAQWA », slug `taqwa`, Conakry / Ratoma / Kipé, Guinée, vérifiée, fuseau Africa/Conakry, Orange Money `620 00 00 00`, statut « Essai — expire dans 47 jours ».
- **Horaires** (Adhan / Iqama) : Fajr 05:30 / 05:45 · Dhuhr 13:15 / 13:30 · Asr 16:20 / 16:30 · Maghrib 19:05 / 19:10 · Isha 20:30 / 20:40 · Jumu'ah 13:30 / 13:45.
- **Annonces** : (1) 📌 « Collecte pour la réfection de la toiture » (épinglée) ; (2) « Cours de Tajwid tous les samedis » (avec audio).
- **Événement** : « Conférence — Les mérites du Ramadan », dans 5 jours, 20:30, grande salle.
- **Membres** : Imam « El Hadj Mamadou Diallo » ; Sage « Thierno Saïd » ; Conseiller « Ibrahima Bah » ; Équipe « Comité des jeunes ». (Aucune photo.)
- **Super-admin** : « Abdoulaye Bah ». Autres mosquées de démo dans les listes : « Mosquée Kokoma » (Actif), « Mosquée Centrale » (Expire bientôt).

# Exigences techniques du prototype
- **Un seul fichier HTML**, tout inline, aucune requête réseau. Emoji + SVG uniquement, pas d'images externes.
- Rendu dans un **cadre de téléphone** centré ; barre de statut factice en haut optionnelle.
- **Menu de navigation du prototype** (barre latérale ou sélecteur en haut) listant TOUS les écrans ci-dessus, regroupés par univers (Public / Auth / Admin / Super-admin), pour sauter directement à n'importe quel écran.
- Navigation interne fonctionnelle (les onglets et boutons changent réellement d'écran via JS).
- Thème clair. Soigne la fidélité au design system ci-dessus.
- Commente brièvement les zones où le comportement est simulé.

Commence par la page publique de la Mosquée TAQWA, puis rends tous les autres écrans accessibles via le menu du prototype.

════════════════════════════════════════════════════════════════════
FIN DU PROMPT À COLLER
════════════════════════════════════════════════════════════════════

---

## Conseils d'utilisation
- Si le premier artifact est trop lourd, demande à Claude de **le découper** : « génère d'abord l'univers Public, puis l'Admin, puis le Super-admin » en 3 artifacts.
- Pour une démo terrain : garde la version **Public** seule, c'est celle que verront les imams.
- Rappel honnête : ce prototype sert à **montrer/vendre**, pas à remplacer l'app réelle (déjà en production sur amanaconnect.org). Le vrai levier reste les visites terrain.
