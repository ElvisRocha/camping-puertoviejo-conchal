-- Alter the reference_code column to have a default value
ALTER TABLE public.bookings 
ALTER COLUMN reference_code SET DEFAULT ('CPVC-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 5)));