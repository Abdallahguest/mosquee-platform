-- Migration 0001 — Champs d'abonnement sur la table mosques
-- À exécuter dans l'éditeur SQL de Neon APRÈS avoir créé une branche de secours.
--
-- Ajoute trois colonnes pour gérer le cycle de vie des abonnements :
--   trial_ends_at       : date de fin de la période gratuite
--   paid_until          : date jusqu'à laquelle le service est payé
--   subscription_status : 'trial' | 'active' | 'expired' | 'suspended'
--
-- Les mosquées existantes sont mises en 'trial' avec une trial_ends_at calculée
-- à 3 mois après leur date de création (comportement rétroactif juste).

ALTER TABLE mosques
  ADD COLUMN IF NOT EXISTS trial_ends_at        TIMESTAMP,
  ADD COLUMN IF NOT EXISTS paid_until            TIMESTAMP,
  ADD COLUMN IF NOT EXISTS subscription_status   VARCHAR(20) NOT NULL DEFAULT 'trial';

-- Initialiser les mosquées existantes : trial_ends_at = created_at + 3 mois
UPDATE mosques
SET trial_ends_at = created_at + INTERVAL '3 months'
WHERE trial_ends_at IS NULL;

-- Vérification
SELECT id, name, created_at, trial_ends_at, paid_until, subscription_status
FROM mosques
ORDER BY created_at;
