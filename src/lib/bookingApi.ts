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
    const trimmedCode = referenceCode.trim().toUpperCase();

    // Call edge function which uses service_role to bypass RLS
    const { data, error: fnError } = await supabase.functions.invoke('lookup-booking', {
      body: { referenceCode: trimmedCode },
    });

    if (fnError) {
      // Check response status from edge function error
      const msg = fnError.message || '';
      if (msg.includes('not_found') || fnError.context?.status === 404) {
        return { bookingId: null, bookingData: null, error: new Error('not_found'), errorType: 'not_found' };
      }
      if (msg.includes('cancelled') || fnError.context?.status === 410) {
        return { bookingId: null, bookingData: null, error: new Error('cancelled'), errorType: 'cancelled' };
      }
      return { bookingId: null, bookingData: null, error: new Error(msg), errorType: 'general' };
    }

    if (!data?.booking) {
      return { bookingId: null, bookingData: null, error: new Error('not_found'), errorType: 'not_found' };
    }

    const bookingRow = data.booking;

    // DB stores tent_type as '2-person'; frontend uses 'tent-2'
    const rentedTents: TentSelection[] = (data.tents || []).map((t: Record<string, unknown>) => ({
      tentId: String(t.tent_type).replace(/^(\d+)-person$/, 'tent-$1'),
      quantity: Number(t.quantity),
    }));

    const addonIds: string[] = (data.addons || []).map((a: Record<string, unknown>) => String(a.addon_type));

    const g = data.guestInfo;
    const guestInfo: GuestInfo = {
      fullName: String(g?.full_name || ''),
      email: String(g?.email || ''),
      phone: String(g?.phone || ''),
      country: String(g?.country || ''),
      arrivalTime: String(g?.arrival_time || ''),
      specialRequests: String(g?.special_requests || ''),
      celebratingOccasion: String(g?.celebrating_occasion || ''),
    };

    const checkIn = new Date(bookingRow.check_in + 'T12:00:00');
    const checkOut = new Date(bookingRow.check_out + 'T12:00:00');
    const nights = differenceInDays(checkOut, checkIn);

    const bookingData: Partial<Booking> = {
      checkIn,
      checkOut,
      nights,
      guests: {
        adults: Number(bookingRow.adults),
        children: Number(bookingRow.children),
        infants: Number(bookingRow.infants),
      },
      accommodation: {
        bringOwnTent: Boolean(bookingRow.bring_own_tent),
        rentedTents,
      },
      addOns: addonIds,
      guestInfo,
      status: String(bookingRow.status) as 'pending' | 'confirmed' | 'cancelled',
    };

    return { bookingId: String(bookingRow.id), bookingData, error: null };
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
        // Convert frontend ID 'tent-2' back to DB format '2-person'
        const dbTentType = t.tentId.replace(/^tent-(\d+)$/, '$1-person');
        return {
          booking_id: bookingId,
          tent_type: dbTentType,
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
