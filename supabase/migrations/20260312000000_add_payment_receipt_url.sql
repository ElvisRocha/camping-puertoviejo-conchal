-- Add payment_receipt_url column to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;

-- Create Supabase Storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone (anon + authenticated) to upload receipts
CREATE POLICY "Anyone can upload payment receipts"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'payment-receipts');

-- Allow anyone to view/download receipts (public bucket)
CREATE POLICY "Anyone can view payment receipts"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'payment-receipts');
