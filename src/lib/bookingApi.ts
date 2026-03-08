import { supabase } from '@/integrations/supabase/client';
import type { Booking, PricingBreakdown, GuestInfo, TentSelection } from '@/types/booking';
import { TENT_OPTIONS } from '@/types/booking';
import { differenceInDays } from 'date-fns';

interface CreateBookingParams {
  booking: Partial<Booking>;
  pricing: PricingBreakdown;
}

export async function createBooking({ booking, pricing }: CreateBookingParams): Promise<{ referenceCode: string; error: Error | null }> {
  try {
    // Call the Edge Function which handles all inserts server-side with service role
    const { data, error } = await supabase.functions.invoke('create-booking', {
      body: { booking, pricing },
    });

    if (error) {
      console.error('Edge function error:', error);
      return { referenceCode: '', error: new Error(error.message || 'Failed to create booking') };
    }

    if (!data?.referenceCode) {
      return { referenceCode: '', error: new Error('No reference code returned') };
    }

    return { referenceCode: data.referenceCode, error: null };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { referenceCode: '', error: error as Error };
  }
}

export interface LookupBookingResult {
  bookingId: string | null;
  bookingData: Partial<Booking> | null;
  error: Error | null;
  errorType?: 'not_found' | 'cancelled' | 'general';
}

export async function lookupBookingByReference(referenceCode: string): Promise<LookupBookingResult> {
  try {
    // Use the dedicated Supabase RPC function that searches by reference_code
    const { data: bookingRows, error } = await supabase
      .rpc('get_booking_by_reference', { ref_code: referenceCode.trim().toUpperCase() });

    if (error) {
      return { bookingId: null, bookingData: null, error: new Error(error.message), errorType: 'general' };
    }

    if (!bookingRows || bookingRows.length === 0) {
      return { bookingId: null, bookingData: null, error: new Error('not_found'), errorType: 'not_found' };
    }

    const data = bookingRows[0];

    if (data.status === 'cancelled') {
      return { bookingId: null, bookingData: null, error: new Error('cancelled'), errorType: 'cancelled' };
    }

    // Fetch related records in parallel
    const [tentsResult, addonsResult, guestInfoResult] = await Promise.all([
      supabase.from('booking_tents').select('*').eq('booking_id', data.id),
      supabase.from('booking_addons').select('*').eq('booking_id', data.id),
      supabase.from('guest_info').select('*').eq('booking_id', data.id).maybeSingle(),
    ]);

    const checkIn = new Date(data.check_in + 'T12:00:00');
    const checkOut = new Date(data.check_out + 'T12:00:00');
    const nights = differenceInDays(checkOut, checkIn);

    const rentedTents: TentSelection[] = (tentsResult.data || []).map((t) => ({
      tentId: t.tent_type,
      quantity: t.quantity,
    }));

    const addonIds: string[] = (addonsResult.data || []).map((a) => a.addon_type);

    const guestInfoRaw = guestInfoResult.data;
    const guestInfo: GuestInfo = {
      fullName: guestInfoRaw?.full_name || '',
      email: guestInfoRaw?.email || '',
      phone: guestInfoRaw?.phone || '',
      country: guestInfoRaw?.country || '',
      arrivalTime: guestInfoRaw?.arrival_time || '',
      specialRequests: guestInfoRaw?.special_requests || '',
      celebratingOccasion: guestInfoRaw?.celebrating_occasion || '',
    };

    const bookingData: Partial<Booking> = {
      checkIn,
      checkOut,
      nights,
      guests: {
        adults: data.adults,
        children: data.children,
        infants: data.infants,
      },
      accommodation: {
        bringOwnTent: data.bring_own_tent,
        rentedTents,
      },
      addOns: addonIds,
      guestInfo,
      status: data.status as 'pending' | 'confirmed' | 'cancelled',
    };

    return { bookingId: data.id, bookingData, error: null };
  } catch (error) {
    console.error('Error looking up booking:', error);
    return { bookingId: null, bookingData: null, error: error as Error, errorType: 'general' };
  }
}

interface UpdateBookingParams {
  bookingId: string;
  booking: Partial<Booking>;
  pricing: PricingBreakdown;
}

export async function updateBooking({ bookingId, booking, pricing }: UpdateBookingParams): Promise<{ error: Error | null }> {
  try {
    const checkInStr = booking.checkIn instanceof Date
      ? booking.checkIn.toISOString().split('T')[0]
      : String(booking.checkIn);
    const checkOutStr = booking.checkOut instanceof Date
      ? booking.checkOut.toISOString().split('T')[0]
      : String(booking.checkOut);

    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        check_in: checkInStr,
        check_out: checkOutStr,
        adults: booking.guests?.adults ?? 0,
        children: booking.guests?.children ?? 0,
        infants: booking.guests?.infants ?? 0,
        bring_own_tent: booking.accommodation?.bringOwnTent ?? true,
        campsite_fee: pricing.campsiteFee,
        tent_rental_fee: pricing.tentRental,
        addons_fee: pricing.addOns,
        subtotal: pricing.subtotal,
        taxes: pricing.taxes,
        total: pricing.total,
      })
      .eq('id', bookingId);

    if (bookingError) throw bookingError;

    // Delete and re-insert tents
    await supabase.from('booking_tents').delete().eq('booking_id', bookingId);

    if (!booking.accommodation?.bringOwnTent && booking.accommodation?.rentedTents?.length) {
      const tentInserts = booking.accommodation.rentedTents.map((t) => {
        const tentOption = TENT_OPTIONS.find((opt) => opt.id === t.tentId);
        return {
          booking_id: bookingId,
          tent_type: t.tentId,
          quantity: t.quantity,
          price_per_night: tentOption?.pricePerNight ?? 0,
        };
      });
      const { error: tentError } = await supabase.from('booking_tents').insert(tentInserts);
      if (tentError) throw tentError;
    }

    // Update guest info
    if (booking.guestInfo) {
      const { error: guestError } = await supabase
        .from('guest_info')
        .update({
          full_name: booking.guestInfo.fullName,
          email: booking.guestInfo.email,
          phone: booking.guestInfo.phone,
          country: booking.guestInfo.country,
          arrival_time: booking.guestInfo.arrivalTime || null,
          special_requests: booking.guestInfo.specialRequests || null,
          celebrating_occasion: booking.guestInfo.celebratingOccasion || null,
        })
        .eq('booking_id', bookingId);
      if (guestError) throw guestError;
    }

    return { error: null };
  } catch (error) {
    console.error('Error updating booking:', error);
    return { error: error as Error };
  }
}
