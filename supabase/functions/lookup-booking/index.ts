import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Map DB tent_type (e.g. '2-person') back to frontend tent ID (e.g. 'tent-2')
function dbTentTypeToId(tentType: string): string {
  const match = tentType.match(/^(\d+)-person$/)
  if (match) return `tent-${match[1]}`
  return tentType
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { ref_code } = await req.json()

    if (!ref_code || typeof ref_code !== 'string') {
      return new Response(
        JSON.stringify({ error: 'ref_code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Find booking by reference_code
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_code', ref_code.trim().toUpperCase())
      .maybeSingle()

    if (bookingError) {
      return new Response(
        JSON.stringify({ error: 'Database error', details: bookingError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!booking) {
      return new Response(
        JSON.stringify({ error: 'not_found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (booking.status === 'cancelled') {
      return new Response(
        JSON.stringify({ error: 'cancelled' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Fetch related records in parallel
    const [tentsResult, addonsResult, guestInfoResult] = await Promise.all([
      supabase.from('booking_tents').select('*').eq('booking_id', booking.id),
      supabase.from('booking_addons').select('*').eq('booking_id', booking.id),
      supabase.from('guest_info').select('*').eq('booking_id', booking.id).maybeSingle(),
    ])

    const tents = (tentsResult.data || []).map((t: { tent_type: string; quantity: number }) => ({
      tentId: dbTentTypeToId(t.tent_type),
      quantity: t.quantity,
    }))

    const addonIds = (addonsResult.data || []).map((a: { addon_type: string }) => a.addon_type)

    const g = guestInfoResult.data
    const guestInfo = {
      fullName: g?.full_name || '',
      email: g?.email || '',
      phone: g?.phone || '',
      country: g?.country || '',
      arrivalTime: g?.arrival_time || '',
      specialRequests: g?.special_requests || '',
      celebratingOccasion: g?.celebrating_occasion || '',
    }

    return new Response(
      JSON.stringify({
        id: booking.id,
        referenceCode: booking.reference_code,
        status: booking.status,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        adults: booking.adults,
        children: booking.children,
        infants: booking.infants,
        bringOwnTent: booking.bring_own_tent,
        tents,
        addonIds,
        guestInfo,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
