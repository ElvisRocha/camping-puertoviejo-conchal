-- Track how much was deposited and how much remains
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_due    NUMERIC(12,2) DEFAULT 0;
