import { supabase } from '@/integrations/supabase/client';
import type { Booking, PricingBreakdown } from '@/types/booking';

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
