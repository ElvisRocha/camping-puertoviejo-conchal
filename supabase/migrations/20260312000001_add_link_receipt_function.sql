-- Secure function to link a payment receipt URL to a booking.
-- SECURITY DEFINER bypasses RLS so the anon client can update
-- payment_receipt_url without needing a broad UPDATE policy.
CREATE OR REPLACE FUNCTION public.link_payment_receipt(ref_code TEXT, receipt_url TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.bookings
  SET payment_receipt_url = receipt_url
  WHERE reference_code = ref_code;
END;
$$;
