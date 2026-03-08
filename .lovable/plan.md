

## Plan: Fix reschedule pre-fill by using the existing `get_booking_details_by_reference` RPC

### Problem
The current `lookupBookingByReference` function in `bookingApi.ts` fetches the booking via `get_booking_by_reference` (works, SECURITY DEFINER), but then queries `booking_tents`, `booking_addons`, and `guest_info` tables directly. These tables have RLS policies that only allow admin SELECT, so anonymous users get empty results -- meaning tents, addons, and guest info are never pre-filled.

There is already a database function `get_booking_details_by_reference` (SECURITY DEFINER) that returns all data (booking + tents + addons + guest_info) in a single JSON response, bypassing RLS.

### Changes

**1. `src/lib/bookingApi.ts` -- Rewrite `lookupBookingByReference`**
- Replace the current multi-query approach with a single call to `supabase.rpc('get_booking_details_by_reference', { ref_code })`.
- Parse the returned JSON to extract booking, tents, addons, and guest_info.
- Map them into the same `Partial<Booking>` shape already expected by `setReschedulingData`.

This single change fixes everything: dates, guests, accommodation, addons, and all guest info fields (name, email, phone, country, arrival time, special requests, celebrating occasion) will be properly loaded and pre-filled across all booking steps.

### Why no other changes are needed
- `setReschedulingData` in the store already merges the full `bookingData` into `booking` state.
- `Step1Dates`, `Step2Guests`, `Step4Summary` all read from `booking` state, so pre-filled data automatically appears in all form fields.
- Error handling (not_found, cancelled) remains the same.

