-- 005_create_payments.sql

-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Create enum only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'payment_status'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');
  END IF;
END $$;

-- 2) If the enum already exists, make sure it has needed values (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'payment_status'
      AND n.nspname = 'public'
      AND e.enumlabel = 'refunded'
  ) THEN
    ALTER TYPE public.payment_status ADD VALUE 'refunded';
  END IF;
END $$;

-- 3) Create payments table (first-run)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  reference_no VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4) If table already existed from previous attempts, ensure columns exist
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS reservation_id UUID,
  ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS status public.payment_status,
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
  ADD COLUMN IF NOT EXISTS reference_no VARCHAR(100),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Make sure status has a default and is not null (safe even if already set)
ALTER TABLE payments
  ALTER COLUMN status SET DEFAULT 'pending';

-- 5) Add FK only if missing (prevents "constraint already exists")
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'payments_reservation_id_fkey'
  ) THEN
    ALTER TABLE payments
      ADD CONSTRAINT payments_reservation_id_fkey
      FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6) Indexes (only after columns exist)
CREATE INDEX IF NOT EXISTS idx_payments_reservation_id
  ON payments(reservation_id);

CREATE INDEX IF NOT EXISTS idx_payments_status
  ON payments(status);
