
-- Add payment receipt URL column to bookings
ALTER TABLE public.bookings ADD COLUMN payment_receipt_url text DEFAULT null;

-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', false);

-- Allow anyone to upload to payment-receipts bucket
CREATE POLICY "Anyone can upload payment receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-receipts');

-- Allow admins to view payment receipts
CREATE POLICY "Admins can view payment receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-receipts' AND public.has_role(auth.uid(), 'admin'::public.app_role));
