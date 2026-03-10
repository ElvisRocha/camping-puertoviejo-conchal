import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { referenceCode } = await req.json()
    if (!referenceCode?.trim()) {
      return new Response(JSON.stringify({ error: 'Reference code is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing external Supabase credentials:', { hasUrl: !!supabaseUrl, hasKey: !!serviceRoleKey })
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const code = referenceCode.trim().toUpperCase()

    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_code', code)
      .maybeSingle()

    if (bErr) throw bErr
    if (!booking) {
      return new Response(JSON.stringify({ found: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const [tentsRes, addonsRes, guestRes] = await Promise.all([
      supabase.from('booking_tents').select('*').eq('booking_id', booking.id),
      supabase.from('booking_addons').select('*').eq('booking_id', booking.id),
      supabase.from('guest_info').select('*').eq('booking_id', booking.id).maybeSingle(),
    ])

    return new Response(JSON.stringify({
      found: true,
      booking,
      tents: tentsRes.data ?? [],
      addons: addonsRes.data ?? [],
      guest_info: guestRes.data ?? null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('lookup-booking error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
