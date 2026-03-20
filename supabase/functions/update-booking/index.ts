import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const CRC_RATE = 500

const TENT_OPTIONS = [
  { id: 'tent-2', pricePerNight: 15 },
  { id: 'tent-4', pricePerNight: 25 },
  { id: 'tent-6', pricePerNight: 35 },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bookingId, booking, pricing } = await req.json()

    if (!bookingId) {
      return new Response(JSON.stringify({ error: 'Booking ID is required' }), {
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

    const checkIn = booking.checkIn ? new Date(booking.checkIn).toISOString().split('T')[0] : undefined
    const checkOut = booking.checkOut ? new Date(booking.checkOut).toISOString().split('T')[0] : undefined

    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        ...(checkIn && { check_in: checkIn }),
        ...(checkOut && { check_out: checkOut }),
        adults: booking.guests?.adults ?? 0,
        children: booking.guests?.children ?? 0,
        infants: booking.guests?.infants ?? 0,
        bring_own_tent: booking.accommodation?.bringOwnTent ?? true,
        campsite_fee: Math.round(pricing.campsiteFee * 500),
        tent_rental_fee: Math.round(pricing.tentRental * 500),
        addons_fee: Math.round(pricing.addOns * 500),
        subtotal: Math.round(pricing.subtotal * 500),
        taxes: Math.round(pricing.taxes * 500),
        total: Math.round(pricing.total * 500),
      })
      .eq('id', bookingId)

    if (bookingError) throw bookingError

    await supabase.from('booking_tents').delete().eq('booking_id', bookingId)

    if (!booking.accommodation?.bringOwnTent && booking.accommodation?.rentedTents?.length) {
      const tentsToInsert = booking.accommodation.rentedTents.map((t: any) => {
        const tent = TENT_OPTIONS.find(o => o.id === t.tentId)
        return {
          booking_id: bookingId,
          tent_type: t.tentId,
          quantity: t.quantity,
          price_per_night: (tent?.pricePerNight ?? 0) * CRC_RATE,
        }
      })
      const { error: tentError } = await supabase.from('booking_tents').insert(tentsToInsert)
      if (tentError) throw tentError
    }

    if (booking.guestInfo) {
      const { error: guestError } = await supabase
        .from('guest_info')
        .update({
          full_name: `${booking.guestInfo.firstName?.trim() ?? ''} ${booking.guestInfo.lastName?.trim() ?? ''}`.trim(),
          email: booking.guestInfo.email,
          phone: booking.guestInfo.phone,
          country: booking.guestInfo.country,
          arrival_time: booking.guestInfo.arrivalTime || null,
          special_requests: booking.guestInfo.specialRequests || null,
          celebrating_occasion: booking.guestInfo.celebratingOccasion || null,
        })
        .eq('booking_id', bookingId)
      if (guestError) throw guestError
    }

    await supabase.from('booking_addons').delete().eq('booking_id', bookingId)

    if (booking.addOns?.length) {
      const ADD_ONS = [
        { id: 'breakfast', price: 12 },
        { id: 'kayak', price: 35 },
        { id: 'wildlife', price: 25 },
        { id: 'bonfire', price: 20 },
        { id: 'snorkel', price: 15 },
      ]
      const addonsToInsert = booking.addOns.map((addOnId: string) => {
        const addon = ADD_ONS.find(a => a.id === addOnId)
        return {
          booking_id: bookingId,
          addon_type: addOnId,
          quantity: 1,
          price: (addon?.price ?? 0) * CRC_RATE,
        }
      })
      const { error: addonError } = await supabase.from('booking_addons').insert(addonsToInsert)
      if (addonError) throw addonError
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('update-booking error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
