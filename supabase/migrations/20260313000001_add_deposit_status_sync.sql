-- Add 'completed' to the status check constraint
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));

-- Helper: compute the appropriate status from deposit vs total.
-- Rules:
--   cancelled  → always stays cancelled (manual override)
--   deposit >= 100% of total      → completed
--   deposit >= 50% and < 100%     → pending
--   deposit <  50% of total       → pending
CREATE OR REPLACE FUNCTION public.compute_booking_status(
  p_deposit        NUMERIC,
  p_total          NUMERIC,
  p_current_status TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_current_status = 'cancelled' THEN
    RETURN 'cancelled';
  END IF;

  IF p_total IS NULL OR p_total <= 0 THEN
    RETURN 'pending';
  END IF;

  IF p_deposit >= p_total THEN
    RETURN 'completed';
  ELSE
    RETURN 'pending';
  END IF;
END;
$$;

-- Trigger function: re-compute status whenever deposit_amount or balance_due changes
CREATE OR REPLACE FUNCTION public.sync_status_on_deposit_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.status := public.compute_booking_status(
    COALESCE(NEW.deposit_amount, 0),
    NEW.total,
    NEW.status
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if present, then recreate
DROP TRIGGER IF EXISTS trg_sync_status_with_deposit ON public.bookings;

CREATE TRIGGER trg_sync_status_with_deposit
BEFORE UPDATE OF deposit_amount, balance_due ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.sync_status_on_deposit_change();

-- Update update_booking_deposit to also set status automatically
CREATE OR REPLACE FUNCTION public.update_booking_deposit(
  ref_code  TEXT,
  p_deposit NUMERIC,
  p_balance NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total          NUMERIC;
  v_current_status TEXT;
  v_new_status     TEXT;
BEGIN
  SELECT total, status
    INTO v_total, v_current_status
    FROM public.bookings
   WHERE reference_code = ref_code;

  v_new_status := public.compute_booking_status(p_deposit, v_total, v_current_status);

  UPDATE public.bookings
     SET deposit_amount = p_deposit,
         balance_due    = p_balance,
         status         = v_new_status
   WHERE reference_code = ref_code;
END;
$$;

-- Backfill existing non-cancelled records to the correct status
UPDATE public.bookings
   SET status = public.compute_booking_status(
                  COALESCE(deposit_amount, 0),
                  total,
                  status
                )
 WHERE status != 'cancelled';
