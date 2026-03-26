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
    const { bookingId } = await req.json()

    if (!bookingId) {
      return new Response(JSON.stringify({ error: 'Booking ID is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing external Supabase credentials')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Check booking exists and is not already cancelled
    const { data: existing, error: fetchError } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('id', bookingId)
      .single()

    if (fetchError || !existing) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (existing.status === 'cancelled') {
      return new Response(JSON.stringify({ error: 'Booking is already cancelled' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    if (updateError) throw updateError

    // Fetch guest info and booking details for n8n notification
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL')
    if (n8nWebhookUrl) {
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('reference_code, check_in, check_out, total, adults, children')
        .eq('id', bookingId)
        .single()

      const { data: guestData } = await supabase
        .from('guest_info')
        .select('full_name, email, phone')
        .eq('booking_id', bookingId)
        .single()

      if (bookingData && guestData) {
        fetch(`${n8nWebhookUrl}/reserva-cancelada`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: guestData.email,
            name: guestData.full_name,
            phone: guestData.phone,
            reference_code: bookingData.reference_code,
            fecha_checkin: bookingData.check_in.split('-').reverse().join('/'),
            fecha_checkout: bookingData.check_out.split('-').reverse().join('/'),
            total: bookingData.total,
          }),
        }).catch((err) => console.error('n8n webhook error:', err))
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('cancel-booking error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})