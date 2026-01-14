-- Drop existing restrictive INSERT policies
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create booking tents" ON public.booking_tents;
DROP POLICY IF EXISTS "Anyone can create booking addons" ON public.booking_addons;
DROP POLICY IF EXISTS "Anyone can create guest info" ON public.guest_info;

-- Create new PERMISSIVE INSERT policies for bookings
CREATE POLICY "Anyone can create a booking"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create new PERMISSIVE INSERT policies for booking_tents
CREATE POLICY "Anyone can create booking tents"
ON public.booking_tents
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create new PERMISSIVE INSERT policies for booking_addons
CREATE POLICY "Anyone can create booking addons"
ON public.booking_addons
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create new PERMISSIVE INSERT policies for guest_info
CREATE POLICY "Anyone can create guest info"
ON public.guest_info
FOR INSERT
TO anon, authenticated
WITH CHECK (true);