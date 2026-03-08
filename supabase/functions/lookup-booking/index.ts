import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { referenceCode } = await req.json()

    if (!referenceCode || typeof referenceCode !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Reference code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const trimmedCode = referenceCode.trim().toUpperCase()

    // Query booking by reference code using service role (bypasses RLS)
    const { data: bookingRow, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_code', trimmedCode)
      .maybeSingle()

    if (bookingError) {
      console.error('Booking query error:', bookingError)
      return new Response(
        JSON.stringify({ error: bookingError.message, errorType: 'general' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!bookingRow) {
      return new Response(
        JSON.stringify({ error: 'not_found', errorType: 'not_found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (bookingRow.status === 'cancelled') {
      return new Response(
        JSON.stringify({ error: 'cancelled', errorType: 'cancelled' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch related data in parallel
    const [tentsResult, addonsResult, guestInfoResult] = await Promise.all([
      supabase.from('booking_tents').select('*').eq('booking_id', bookingRow.id),
      supabase.from('booking_addons').select('*').eq('booking_id', bookingRow.id),
      supabase.from('guest_info').select('*').eq('booking_id', bookingRow.id).maybeSingle(),
    ])

    return new Response(
      JSON.stringify({
        booking: bookingRow,
        tents: tentsResult.data || [],
        addons: addonsResult.data || [],
        guestInfo: guestInfoResult.data || null,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Lookup booking error:', error)
    return new Response(
      JSON.stringify({ error: error.message, errorType: 'general' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
