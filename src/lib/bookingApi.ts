import { supabase } from '@/integrations/supabase/client';
import type { Booking, TentSelection, GuestInfo, PricingBreakdown } from '@/types/booking';
import { TENT_OPTIONS, ADD_ONS } from '@/types/booking';

interface CreateBookingParams {
  booking: Partial<Booking>;
  pricing: PricingBreakdown;
}

// Generate a unique reference code
function generateReferenceCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'CPVC-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createBooking({ booking, pricing }: CreateBookingParams): Promise<{ referenceCode: string; error: Error | null }> {
  try {
    const referenceCode = generateReferenceCode();
    
    // 1. Create the main booking record
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        reference_code: referenceCode,
        check_in: booking.checkIn ? new Date(booking.checkIn).toISOString().split('T')[0] : '',
        check_out: booking.checkOut ? new Date(booking.checkOut).toISOString().split('T')[0] : '',
        adults: booking.guests?.adults || 1,
        children: booking.guests?.children || 0,
        infants: booking.guests?.infants || 0,
        bring_own_tent: booking.accommodation?.bringOwnTent ?? true,
        campsite_fee: pricing.campsiteFee,
        tent_rental_fee: pricing.tentRental,
        addons_fee: pricing.addOns,
        subtotal: pricing.subtotal,
        taxes: pricing.taxes,
        total: pricing.total,
        status: 'confirmed',
      }])
      .select('id, reference_code')
      .single();

    if (bookingError) throw bookingError;
    if (!bookingData) throw new Error('No booking data returned');

    const bookingId = bookingData.id;

    // 2. Insert rented tents if any
    if (!booking.accommodation?.bringOwnTent && booking.accommodation?.rentedTents?.length) {
      const tentsToInsert = booking.accommodation.rentedTents.map((selection: TentSelection) => {
        const tent = TENT_OPTIONS.find(t => t.id === selection.tentId);
        return {
          booking_id: bookingId,
          tent_type: selection.tentId.replace('tent-', '') + '-person',
          quantity: selection.quantity,
          price_per_night: tent?.pricePerNight || 0,
        };
      });

      const { error: tentsError } = await supabase
        .from('booking_tents')
        .insert(tentsToInsert);

      if (tentsError) throw tentsError;
    }

    // 3. Insert add-ons if any
    if (booking.addOns?.length) {
      const addonsToInsert = booking.addOns.map((addOnId: string) => {
        const addon = ADD_ONS.find(a => a.id === addOnId);
        return {
          booking_id: bookingId,
          addon_type: addOnId,
          quantity: 1,
          price: addon?.price || 0,
        };
      });

      const { error: addonsError } = await supabase
        .from('booking_addons')
        .insert(addonsToInsert);

      if (addonsError) throw addonsError;
    }

    // 4. Insert guest info
    if (booking.guestInfo) {
      const { error: guestError } = await supabase
        .from('guest_info')
        .insert({
          booking_id: bookingId,
          full_name: booking.guestInfo.fullName,
          email: booking.guestInfo.email,
          phone: booking.guestInfo.phone,
          country: booking.guestInfo.country,
          arrival_time: booking.guestInfo.arrivalTime || null,
          special_requests: booking.guestInfo.specialRequests || null,
          celebrating_occasion: booking.guestInfo.celebratingOccasion || null,
        });

      if (guestError) throw guestError;
    }

    return { referenceCode, error: null };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { referenceCode: '', error: error as Error };
  }
}
