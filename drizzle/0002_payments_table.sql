-- Migration 0002 — Table payments
-- À exécuter dans l'éditeur SQL de Neon APRÈS avoir créé une branche de secours.

CREATE TABLE IF NOT EXISTS payments (
  id              SERIAL PRIMARY KEY,
  mosque_id       INTEGER NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  recorded_by     VARCHAR(255) REFERENCES users(id),
  amount_gnf      INTEGER NOT NULL,
  months          INTEGER NOT NULL,
  payment_method  VARCHAR(20) NOT NULL,  -- 'cash' | 'orange_money'
  period_start    TIMESTAMP NOT NULL,
  period_end      TIMESTAMP NOT NULL,
  note            TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes par mosquée
CREATE INDEX IF NOT EXISTS payments_mosque_id_idx ON payments(mosque_id);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON payments(created_at DESC);

-- Vérification
SELECT COUNT(*) as payments_count FROM payments;
