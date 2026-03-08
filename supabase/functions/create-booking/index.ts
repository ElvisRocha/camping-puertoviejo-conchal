import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface TentSelection {
  tentId: string;
  quantity: number;
}

interface GuestInfo {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  arrivalTime?: string;
  specialRequests?: string;
  celebratingOccasion?: string;
}

interface PricingBreakdown {
  campsiteFee: number;
  tentRental: number;
  addOns: number;
  subtotal: number;
  taxes: number;
  total: number;
}

interface BookingRequest {
  booking: {
    checkIn?: string;
    checkOut?: string;
    guests?: {
      adults: number;
      children: number;
      infants: number;
    };
    accommodation?: {
      bringOwnTent: boolean;
      rentedTents?: TentSelection[];
    };
    addOns?: string[];
    guestInfo?: GuestInfo;
  };
  pricing: PricingBreakdown;
  paymentReceiptUrl?: string;
}

const TENT_OPTIONS = [
  { id: 'tent-2', pricePerNight: 25 },
  { id: 'tent-4', pricePerNight: 40 },
  { id: 'tent-6', pricePerNight: 55 },
];

const ADD_ONS = [
  { id: 'breakfast', price: 12 },
  { id: 'dinner', price: 18 },
  { id: 'kayak', price: 25 },
  { id: 'bonfire', price: 15 },
  { id: 'hiking', price: 20 },
  { id: 'sunset-cruise', price: 45 },
  { id: 'yoga', price: 15 },
  { id: 'fishing', price: 30 },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { booking, pricing }: BookingRequest = await req.json();

    if (!booking.checkIn || !booking.checkOut) {
      return new Response(
        JSON.stringify({ error: 'Check-in and check-out dates are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (checkOutDate <= checkInDate) {
      return new Response(
        JSON.stringify({ error: 'Check-out must be after check-in' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adults = booking.guests?.adults ?? 1;
    if (adults < 1) {
      return new Response(
        JSON.stringify({ error: 'At least one adult is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!booking.guestInfo?.fullName?.trim() || !booking.guestInfo?.email?.trim() || !booking.guestInfo?.phone?.trim() || !booking.guestInfo?.country?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Guest information is incomplete' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('EXTERNAL_SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing external Supabase credentials:', { hasUrl: !!supabaseUrl, hasKey: !!supabaseServiceKey });
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        check_in: checkInDate.toISOString().split('T')[0],
        check_out: checkOutDate.toISOString().split('T')[0],
        adults: adults,
        children: booking.guests?.children ?? 0,
        infants: booking.guests?.infants ?? 0,
        bring_own_tent: booking.accommodation?.bringOwnTent ?? true,
        campsite_fee: pricing.campsiteFee,
        tent_rental_fee: pricing.tentRental,
        addons_fee: pricing.addOns,
        subtotal: pricing.subtotal,
        taxes: pricing.taxes,
        total: pricing.total,
        status: 'confirmed',
      })
      .select('id, reference_code')
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return new Response(
        JSON.stringify({ error: 'Failed to create booking', details: bookingError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bookingId = bookingData.id;
    const referenceCode = bookingData.reference_code;

    if (!booking.accommodation?.bringOwnTent && booking.accommodation?.rentedTents?.length) {
      const tentsToInsert = booking.accommodation.rentedTents.map((selection) => {
        const tent = TENT_OPTIONS.find(t => t.id === selection.tentId);
        return {
          booking_id: bookingId,
          tent_type: selection.tentId.replace('tent-', '') + '-person',
          quantity: selection.quantity,
          price_per_night: tent?.pricePerNight ?? 0,
        };
      });

      const { error: tentsError } = await supabase
        .from('booking_tents')
        .insert(tentsToInsert);

      if (tentsError) {
        console.error('Error inserting tents:', tentsError);
      }
    }

    if (booking.addOns?.length) {
      const addonsToInsert = booking.addOns.map((addOnId) => {
        const addon = ADD_ONS.find(a => a.id === addOnId);
        return {
          booking_id: bookingId,
          addon_type: addOnId,
          quantity: 1,
          price: addon?.price ?? 0,
        };
      });

      const { error: addonsError } = await supabase
        .from('booking_addons')
        .insert(addonsToInsert);

      if (addonsError) {
        console.error('Error inserting addons:', addonsError);
      }
    }

    if (booking.guestInfo) {
      const { error: guestError } = await supabase
        .from('guest_info')
        .insert({
          booking_id: bookingId,
          full_name: booking.guestInfo.fullName.trim().slice(0, 200),
          email: booking.guestInfo.email.trim().slice(0, 255),
          phone: booking.guestInfo.phone.trim().slice(0, 50),
          country: booking.guestInfo.country.trim().slice(0, 100),
          arrival_time: booking.guestInfo.arrivalTime?.trim().slice(0, 50) || null,
          special_requests: booking.guestInfo.specialRequests?.trim().slice(0, 1000) || null,
          celebrating_occasion: booking.guestInfo.celebratingOccasion?.trim().slice(0, 200) || null,
        });

      if (guestError) {
        console.error('Error inserting guest info:', guestError);
      }
    }

    return new Response(
      JSON.stringify({ referenceCode }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
