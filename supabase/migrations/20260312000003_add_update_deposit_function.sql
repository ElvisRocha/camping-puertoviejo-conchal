-- Secure function to set deposit_amount and balance_due on a booking.
-- SECURITY DEFINER bypasses RLS so the anon client can update these
-- fields without needing a broad UPDATE policy on bookings.
CREATE OR REPLACE FUNCTION public.update_booking_deposit(
  ref_code   TEXT,
  p_deposit  NUMERIC,
  p_balance  NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.bookings
  SET deposit_amount = p_deposit,
      balance_due    = p_balance
  WHERE reference_code = ref_code;
END;
$$;
