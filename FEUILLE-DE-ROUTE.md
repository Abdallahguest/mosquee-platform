# Amana Connect — Feuille de route (aujourd'hui → objectif final)

> Compagnon de [`PASSATION-AMANA-CONNECT.md`](PASSATION-AMANA-CONNECT.md). La passation décrit **l'état** ; ce document décrit **le chemin**.
> **Point de départ : 19 juillet 2026.** Produit ≈ 9/10, entreprise ≈ 2/10, **0 mosquée payante, 0 GNF.**
> Règle qui gouverne tout ce document : **le terrain prime sur le code. Le seul chiffre qui compte aujourd'hui, c'est le nombre de conversations de vente par semaine.**

---

## 0. L'objectif final, dit honnêtement

**« La fin » = une entreprise logicielle 100 % halal, rentable et durable, valorisée autour de 1 à 2 milliards GNF, sans avoir jamais contracté de dette à intérêt.**

Le patrimoine milliardaire ne viendra **pas** du cash des abonnements guinéens seuls (voir §8, le calcul). Il viendra de la **valeur de l'entreprise** : un revenu annuel récurrent (ARR) de ~250 M GNF (~520 mosquées payantes) vaut, à un multiple prudent de 4–8×, **1 à 2 milliards GNF**. Milliardaire en **patrimoine**, pas en compte courant — comme presque tous les fondateurs.

Les trois accélérateurs qui font passer d'un revenu guinéen modeste à cette valorisation :
1. **Diaspora** (paiements en devises fortes : EUR/USD).
2. **Sous-région** (Mali, Sénégal, Côte d'Ivoire).
3. **Ramadan** comme moteur commercial annuel (pic d'usage et de générosité).

---

## 1. L'échelle de progression (comment je mesure « où j'en suis »)

L'entreprise, pas le produit. Le produit est déjà à 9.

| Palier | Preuve à obtenir |
|:---:|---|
| **2** | *(aujourd'hui)* 4 mosquées actives, usage réel, 0 revenu |
| **3** | **1ʳᵉ mosquée payante** (1 paiement réel encaissé + reçu écrit) |
| **4** | **Taux de conversion connu** sur **20+ visites** documentées |
| **5** | **1er renouvellement** (une mosquée paie son 2ᵉ mois) |
| **6** | **10 payantes + statut juridique + procédures** (bus factor cassé) |
| **7** | ~50 payantes, 1ʳᵉ personne recrutée, tarification validée |
| **8** | ~200 payantes, sous-région amorcée, Ramadan exploité |
| **9** | ~520 payantes / ~250 M GNF ARR — valorisation 1–2 Mrd GNF |
| **10** | Entreprise autonome de moi (survivrait à mon absence 3 mois) |

---

## 2. Phase 0 — « La première pièce » (palier 2 → 3)

**Objectif unique : encaisser le premier paiement réel.** Rien d'autre ne compte dans cette phase.
**Échéance cible : le plus vite possible — viser 4 à 6 semaines (fin août 2026).**

**Porte de sortie (gate) :** 1 mosquée a payé au moins 1 mois (espèces ou Orange Money), reçu écrit remis, paiement enregistré dans la table `payments`.

**Actions clés (100 % terrain) :**
- [ ] Choisir la mosquée la plus « chaude » parmi les 4 actives (probablement TAQWA ou Kokoma).
- [ ] Préparer/relire `terrain/script-presentation.md` + `terrain/fiche-questions.md`.
- [ ] Fixer un rendez-vous en personne avec le décideur (imam / président du comité).
- [ ] Faire la démo depuis le téléphone, sur leur vraie page mosquée en production.
- [ ] Demander l'engagement (`terrain/engagement-1page.md`) et **proposer de payer maintenant**.
- [ ] Remettre un reçu (`terrain/recu-paiement.md`), enregistrer dans `suivi-paiements.md` **dans l'heure**.

**Ce qu'on NE fait PAS (garde anti-israf) :**
- Aucune nouvelle fonctionnalité. Aucune ligne de code, sauf blocage terrain avéré (§7).
- Pas de « je code encore une petite amélioration avant d'oser demander l'argent ». C'est de l'évitement.

**Risque n°1 :** la peur de demander l'argent déguisée en « le produit n'est pas encore prêt ». Il l'est. Le blocage est humain, pas technique.

---

## 3. Phase 1 — « Prouver le modèle » (palier 3 → 6)

**Objectif : passer de 1 à 10 mosquées payantes, obtenir le premier renouvellement, et sécuriser l'entreprise (juridique + bus factor).**
**Échéance cible : de septembre 2026 à Ramadan 2027 (~février 2027).** Objectif intermédiaire : **20 mosquées actives avant le Ramadan.**

**Portes de sortie successives :**
- **→ Palier 4 :** taux de conversion connu sur **20+ visites documentées** (`suivi-visites.md` rempli après chaque visite).
- **→ Palier 5 :** une mosquée paie son **2ᵉ mois** (preuve que la valeur est réelle, pas un achat de politesse).
- **→ Palier 6 :** **10 payantes** + **formalisation juridique (APIP)** + **procédures écrites**.

**Rythme hebdomadaire NON négociable :**
- **3 visites terrain** (4–5 h) · suivi des mosquées existantes (1–2 h) · mise à jour des tableaux (30 min) · **code : 0 h par défaut.**

**Actions clés :**
- [ ] **Conversion : préparer chaque conversation à J-30** de l'expiration de chaque période gratuite.
- [ ] Tenir le rythme de **3 visites/semaine** et remplir `suivi-visites.md` immédiatement.
- [ ] **Casser le bus factor** (à faire dès les premiers paiements, avant toute autre technique) :
  - [ ] 2ᵉ compte super-admin, identifiants **scellés hors ligne**.
  - [ ] Document de reprise **chiffré** (accès Neon, Vercel, Cloudflare, Resend, R2).
  - [ ] **Restauration Neon testée une fois** (prouver qu'une sauvegarde se restaure).
- [ ] **Vercel Pro** dès le **premier franc encaissé** (le plan Hobby interdit l'usage commercial — enjeu de licéité + de conformité).
- [ ] **Compte Orange Money dédié entreprise**, séparé du personnel (traçabilité, anti-confusion).
- [ ] **Formalisation juridique (APIP)** — déclencheur : **10 mosquées payantes** (pas avant : israf administratif).

**Ce qu'on NE fait PAS :**
- Pas de tarification différenciée, pas de diaspora, pas d'E2E, pas de module caisse. Trop tôt.
- On ne reprend PAS le chantier sécurité de la branche `wip/` tant qu'il n'y a pas de revenu à protéger.

---

## 4. Phase 2 — « Structurer » (palier 6 → 7)

**Objectif : ~50 mosquées payantes, et transformer un one-man-show en petite structure.**
**Échéance cible : 2027 (année Ramadan → fin d'année).**

**Porte de sortie :** ~50 payantes, revenus mensuels récurrents suffisants pour rémunérer une 1ʳᵉ personne, procédures assez solides pour déléguer.

**Actions clés :**
- [ ] **1ʳᵉ embauche** : un profil **terrain/relation** (pas un développeur). Le goulot est commercial, pas technique.
- [ ] **Procédures écrites** : onboarding d'une mosquée, encaissement, relance, support de niveau 1.
- [ ] **Valider la tarification** (le 40 000 GNF/mois codé en dur devient un vrai paramètre, testé) — introduire éventuellement une **tarification différenciée** (grande mosquée urbaine vs petite mosquée rurale).
- [ ] **Reprise technique ciblée, financée par le besoin** : à ce stade seulement, réactiver la branche `wip/` en **option B** (finir UNE chose de bout en bout : très probablement les **rôles support/billing** pour déléguer, ou un **MFA réellement appliqué à la connexion**). Voir §9.

**Ce qu'on NE fait PAS :** on ne recrute pas de développeur tant que le produit tient (il tient). On ne s'étend pas encore hors de Guinée.

---

## 5. Phase 3 — « Démultiplier : Ramadan + sous-région » (palier 7 → 8)

**Objectif : ~200 mosquées payantes, en faisant du Ramadan un moteur annuel et en franchissant les frontières.**
**Échéance cible : 2028 (autour du Ramadan 2028).**

**Porte de sortie :** ~200 payantes, dont une part hors Guinée, avec un cycle commercial Ramadan rodé.

**Actions clés :**
- [ ] **Campagne Ramadan** : le pic d'usage et de générosité devient le rendez-vous d'acquisition n°1 de l'année. Préparé 2 mois avant.
- [ ] **Ouverture sous-région** : Mali → Sénégal → Côte d'Ivoire (mêmes usages, réseaux de mosquées denses). Adapter fuseau, devise, moyens de paiement locaux (Wave, Moov, etc.).
- [ ] **Équipe terrain régionale** : un relais par pays/zone, formé sur les procédures de Phase 2.
- [ ] Support multilingue déjà prêt (FR/EN/AR) — atout structurel.

**Ce qu'on NE fait PAS :** pas de sur-adaptation pays par pays au début ; on réutilise la plateforme telle quelle et on n'ajoute un paiement local que quand une zone le **bloque réellement**.

---

## 6. Phase 4 — « Diaspora & valorisation » (palier 8 → 9, « la fin »)

**Objectif : ~520 mosquées payantes / ~250 M GNF ARR → valorisation 1–2 Mrd GNF.**
**Échéance cible : 2029–2030.**

**Porte de sortie :** ARR ~250 M GNF, dont une **part significative en devises fortes** (diaspora), et une entreprise dont la valeur (pas le compte en banque) atteint le milliard.

**Actions clés :**
- [ ] **Diaspora** : mosquées et associations guinéennes/ouest-africaines en Europe et Amérique du Nord, qui paient en EUR/USD. C'est le levier qui change l'échelle de valorisation.
- [ ] **ARR propre et prouvé** : churn faible, renouvellements automatiques (toujours sans riba : rappel + paiement volontaire, jamais de prélèvement forcé ni pénalité).
- [ ] **Dossier de valorisation** : comptes clairs, procédures, faible dépendance au fondateur (palier 10 en ligne de mire).
- [ ] Si besoin de capital pour accélérer : **musharaka** uniquement (investisseur en parts réelles, partageant profits **et** pertes). **Jamais de dette à intérêt.**

---

## 7. Quand ai-je le droit de recoder ? (déclencheur unique)

**Par défaut : 0 h de code.** J'ouvre l'éditeur seulement si **un blocage terrain concret** l'exige, c'est-à-dire quand une mosquée ne peut pas payer ou utiliser le service à cause d'un manque produit **prouvé par une visite**, pas supposé.

Test à me poser avant chaque session de code : *« Quelle conversation de vente précise ce code débloque-t-il cette semaine ? »* Si je n'ai pas de réponse nominative (telle mosquée, tel obstacle), je referme l'éditeur et je vais sur le terrain.

---

## 8. Le calcul du milliard, sans illusion

- **1 milliard GNF ≈ 115 000 USD.**
- Par les **abonnements guinéens seuls** (40 000 GNF/mois) : atteindre 1 Mrd GNF de **cash** cumulé = 4+ années à ~500 mosquées payantes. Lent.
- Le vrai chemin est la **valorisation** : à **~250 M GNF d'ARR** (~520 mosquées), à un multiple prudent de **4–8× le revenu récurrent**, l'entreprise vaut **1 à 2 Mrd GNF**.
- Conclusion : **milliardaire en patrimoine, pas en liquidités.** L'objectif n'est pas d'accumuler du cash mais de **construire un actif** qui vaut un milliard — et de le faire proprement (halal), donc durablement.

---

## 9. Dette technique & reprises futures (branche `wip/securite-mise-de-cote-2026-07`)

Le chantier sécurité écarté le 19/07 vit intact sur cette branche. **Ne le reprendre qu'en Phase 2+**, et en **option B** (finir UNE chose, la prouver par un test, supprimer le reste). Pièges à corriger **avant** toute reprise :
- **Inscription self-service** : l'email de vérification n'est **jamais** envoyé (insert direct ≠ API Better-Auth). Ne pas rouvrir `disableSignUp` sans modération.
- **MFA** : à **vérifier réellement à la connexion**, sinon décoratif.
- **Récupération d'urgence** : colonne `totp_secret varchar(32)` trop courte pour un token UUID (36 car.), page `/emergency-recovery` absente, expiration non vérifiée, collision avec le secret MFA → **table dédiée obligatoire**.

Autres chantiers post-terrain (uniquement > 5 payantes, et seulement si le terrain le réclame) : tests E2E Playwright réels et en CI, export CSV enrichi, tarification différenciée, **module caisse** (projet séparé, horizon 18+ mois).

---

## 10. Métriques à suivre chaque semaine (tableau de bord perso)

| Métrique | Cible Phase 0–1 | Où |
|---|---|---|
| **Conversations de vente / semaine** | **≥ 3** | `terrain/suivi-visites.md` |
| Mosquées payantes (cumul) | ↗ | `terrain/suivi-paiements.md` |
| Taux de conversion (payantes / visites) | à connaître | calcul manuel |
| Renouvellements (2ᵉ mois+) | ↗ | `payments` + suivi |
| Heures de code | **≈ 0** par défaut | honnêteté perso |

Si « heures de code » monte pendant que « conversations de vente » stagne : **signal d'alarme d'évitement.**

---

## 11. Les 5 risques majeurs & leur parade

1. **Évitement par le code** (le plus probable). Parade : règle des 0 h de code + métrique hebdo + §7.
2. **Bus factor = 1** (perte d'accès, maladie). Parade : procédures de Phase 1 **avant** toute nouvelle techno.
3. **Le prix ne passe pas** (40 000 GNF trop cher/pas assez). Parade : le découvrir par 20+ visites (palier 4), ajuster, ne pas deviner.
4. **Dépendance à un seul canal** (Orange Money, Vercel Hobby). Parade : compte OM entreprise dédié + Vercel Pro au 1er franc.
5. **Tension stage vs startup non tranchée.** Parade : voir §12.

---

## 12. Ma situation : stage vs startup (à trancher, pas à ignorer)

Je postule à des postes de développeur tout en construisant Amana Connect. Cette tension est réelle et **non résolue**. Deux lectures honnêtes :
- Un **emploi/stage** apporte un revenu stable et de l'expérience, mais **mange le temps de terrain** qui est le seul levier de croissance de l'entreprise.
- La **startup** a un produit prêt mais **0 revenu** ; elle exige surtout du temps de terrain, pas du temps de code.

**Décision à prendre consciemment** (pas par défaut) : soit je dédie un bloc protégé de temps hebdomadaire au terrain quoi qu'il arrive, soit j'assume un emploi et je pilote Amana Connect à temps partiel avec des objectifs réduits. Le pire scénario est de **coder pour la startup sans faire de terrain** — cumuler les coûts des deux voies sans le bénéfice d'aucune.

---

## 13. Financement (rappel doctrinal)

- **Voie actuelle et par défaut : autofinancement.** Chaque abonnement finance le suivant. Pas de capital externe requis pour les Phases 0–2.
- **Plus tard, si accélération nécessaire : musharaka** (investisseur associé en parts réelles, partage profits **et** pertes).
- **Jamais** : prêt à intérêt, découvert, avance remboursable avec frais, pénalités de retard. Le modèle économique lui-même est sans riba (blocage, jamais dette).

---

## 14. La règle d'or

> **Ranger le code ne fait pas avancer l'entreprise. Une seule mosquée qui paie la fait avancer plus que dix commits.**
>
> Passer l'entreprise de 2 à 6 vaut cent fois plus que passer le produit de 9 à 9,5 — et ça ne demande **aucune ligne de code.**
>
> **Cette semaine : combien de conversations de vente ?**
