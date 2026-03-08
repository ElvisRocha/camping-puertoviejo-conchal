

## Plan: Create `lookup-booking` Edge Function

### Root cause
The `get_booking_details_by_reference` RPC was created via migration but PostgREST's schema cache hasn't refreshed, so the client gets a 404. Edge Functions don't depend on the schema cache and already work (e.g. `create-booking`).

### Changes

**1. Create `supabase/functions/lookup-booking/index.ts`**
- New Edge Function that receives `{ referenceCode: string }` in the body
- Uses `SUPABASE_SERVICE_ROLE_KEY` to query `bookings` by `reference_code`
- If found, also queries `booking_tents`, `booking_addons`, and `guest_info` by `booking_id`
- Returns the full data as JSON (same shape the client already expects)
- Handles not_found, cancelled, and error cases

**2. Update `src/lib/bookingApi.ts` — `lookupBookingByReference`**
- Replace `supabase.rpc('get_booking_details_by_reference', ...)` with `supabase.functions.invoke('lookup-booking', { body: { referenceCode } })`
- Parse the response the same way (booking, tents, addons, guest_info)
- Keep the same return type and error handling

### Why this works
- `create-booking` already uses the same pattern and works fine
- Edge Functions use the service role key, bypassing all RLS
- No dependency on PostgREST schema cache

