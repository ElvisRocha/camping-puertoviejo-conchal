import { supabase } from '@/integrations/supabase/client';
import type { Booking, PricingBreakdown, GuestInfo, TentSelection } from '@/types/booking';
import { TENT_OPTIONS } from '@/types/booking';
import { differenceInDays } from 'date-fns';

const CLOUD_URL = 'https://yvmzzgphvfvaovlmmjsa.supabase.co';
const CLOUD_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bXp6Z3BodmZ2YW92bG1tanNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NzgyNDEsImV4cCI6MjA4NDA1NDI0MX0.PrHpkAE07XXiNLNoNQTxBxcmNSIjAj1t5fu13ibdjY4';

interface CreateBookingParams {
  booking: Partial<Booking>;
  pricing: PricingBreakdown;
  paymentReceiptUrl?: string;
  depositCRC?: number;
}

export async function createBooking({ booking, pricing, paymentReceiptUrl, depositCRC }: CreateBookingParams): Promise<{ referenceCode: string; error: Error | null }> {
  try {
    const cloudUrl = CLOUD_URL;
    const anonKey = CLOUD_ANON_KEY;

    const response = await fetch(`${cloudUrl}/functions/v1/create-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
      },
      body: JSON.stringify({ booking, pricing, paymentReceiptUrl, depositCRC }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      return { referenceCode: '', error: new Error(errBody.error || 'Failed to create booking') };
    }

    const data = await response.json();

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
    const cloudUrl = CLOUD_URL;
    const anonKey = CLOUD_ANON_KEY;

    const response = await fetch(`${cloudUrl}/functions/v1/lookup-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
      },
      body: JSON.stringify({ referenceCode: referenceCode.trim().toUpperCase() }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      return { bookingId: null, bookingData: null, error: new Error(errBody.error || 'Failed to lookup booking'), errorType: 'general' };
    }

    const data = await response.json();

    if (!data || !data.found) {
      return { bookingId: null, bookingData: null, error: new Error('not_found'), errorType: 'not_found' };
    }

    const b = data.booking;
    const result = data;

    if (b.status === 'cancelled') {
      return { bookingId: null, bookingData: null, error: new Error('cancelled'), errorType: 'cancelled' };
    }

    const checkIn = new Date(b.check_in + 'T12:00:00');
    const checkOut = new Date(b.check_out + 'T12:00:00');
    const nights = differenceInDays(checkOut, checkIn);

    const rentedTents: TentSelection[] = (result.tents || []).map((t: { tent_type: string; quantity: number }) => ({
      tentId: t.tent_type,
      quantity: t.quantity,
    }));

    const addonIds: string[] = (result.addons || []).map((a: { addon_type: string }) => a.addon_type);

    const g = result.guest_info;
    const fullNameParts = (g?.full_name || '').split(' ');
    const guestInfo: GuestInfo = {
      firstName: fullNameParts[0] || '',
      lastName: fullNameParts.slice(1).join(' ') || '',
      email: g?.email || '',
      phone: g?.phone || '',
      country: g?.country || '',
      arrivalTime: g?.arrival_time || '',
      specialRequests: g?.special_requests || '',
      celebratingOccasion: g?.celebrating_occasion || '',
    };

    const bookingData: Partial<Booking> = {
      checkIn,
      checkOut,
      nights,
      guests: {
        adults: b.adults,
        children: b.children,
        infants: b.infants,
      },
      accommodation: {
        bringOwnTent: b.bring_own_tent,
        rentedTents,
      },
      addOns: addonIds,
      guestInfo,
      status: b.status as 'pending' | 'confirmed' | 'cancelled',
    };

    return { bookingId: b.id, bookingData, error: null };
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
    const cloudUrl = CLOUD_URL;
    const anonKey = CLOUD_ANON_KEY;

    const response = await fetch(`${cloudUrl}/functions/v1/update-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
      },
      body: JSON.stringify({ bookingId, booking, pricing }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || 'Failed to update booking');
    }

    return { error: null };
  } catch (error) {
    console.error('Error updating booking:', error);
    return { error: error as Error };
  }
}

export async function cancelBooking(bookingId: string): Promise<{ error: Error | null }> {
  try {
    const cloudUrl = CLOUD_URL;
    const anonKey = CLOUD_ANON_KEY;

    const response = await fetch(`${cloudUrl}/functions/v1/cancel-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
      },
      body: JSON.stringify({ bookingId }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || 'Failed to cancel booking');
    }

    return { error: null };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { error: error as Error };
  }
}
