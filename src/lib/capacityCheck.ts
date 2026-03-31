import { supabase } from '@/integrations/supabase/client';

interface CapacityCheckParams {
  checkIn: Date | string | null | undefined;
  checkOut: Date | string | null | undefined;
  adults: number;
  children: number;
}

interface CapacityCheckResult {
  available: boolean;
  maxCapacity?: number;
}

export async function checkCapacity({
  checkIn,
  checkOut,
  adults,
  children,
}: CapacityCheckParams): Promise<CapacityCheckResult> {
  try {
    // Step 1 — Get max capacity from settings
    const { data: settingData, error: settingError } = await supabase
      .from('camping_settings')
      .select('value')
      .eq('key', 'max_capacity_persons')
      .single();

    if (settingError || !settingData) return { available: true };

    const maxCapacity = parseInt(settingData.value, 10);
    if (isNaN(maxCapacity)) return { available: true };

    if (!checkIn || !checkOut) return { available: true };

    const checkInISO = checkIn instanceof Date ? checkIn.toISOString().slice(0, 10) : String(checkIn);
    const checkOutISO = checkOut instanceof Date ? checkOut.toISOString().slice(0, 10) : String(checkOut);

    // Step 2 — Get overlapping active bookings (all except cancelled)
    const { data: overlapping, error: overlapError } = await supabase
      .from('bookings')
      .select('adults, children')
      .neq('status', 'cancelled')
      .lt('check_in', checkOutISO)
      .gt('check_out', checkInISO);

    if (overlapError) return { available: true };

    // Step 3 — Calculate current occupancy
    const currentOccupancy = (overlapping ?? []).reduce(
      (sum, b) => sum + (b.adults ?? 0) + (b.children ?? 0),
      0
    );

    // Step 4 — Validate
    const newGuests = adults + children;
    if (currentOccupancy + newGuests > maxCapacity) {
      return { available: false, maxCapacity };
    }

    return { available: true };
  } catch {
    return { available: true };
  }
}
