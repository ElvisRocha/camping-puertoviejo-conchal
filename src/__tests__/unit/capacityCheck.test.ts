import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkCapacity } from '@/lib/capacityCheck';

// Build a chainable mock for supabase query builder
function createQueryChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.neq = vi.fn().mockReturnValue(chain);
  chain.lt = vi.fn().mockReturnValue(chain);
  chain.gt = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);
  // When used without .single() (bookings query), the chain itself is thenable
  chain.then = (resolve: (v: unknown) => void) => Promise.resolve(result).then(resolve);
  return chain;
}

let settingsResult: { data: unknown; error: unknown };
let bookingsResult: { data: unknown; error: unknown };

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'camping_settings') return createQueryChain(settingsResult);
      if (table === 'bookings') return createQueryChain(bookingsResult);
      return createQueryChain({ data: null, error: null });
    }),
  },
}));

describe('checkCapacity', () => {
  const baseParams = {
    checkIn: new Date(2026, 3, 10),
    checkOut: new Date(2026, 3, 12),
    adults: 3,
    children: 0,
  };

  beforeEach(() => {
    settingsResult = { data: { key: 'max_capacity_persons', value: '20' }, error: null };
    bookingsResult = { data: [], error: null };
  });

  // CC-01
  it('CC-01: returns available when there is capacity', async () => {
    const result = await checkCapacity(baseParams);
    expect(result.available).toBe(true);
  });

  // CC-02
  it('CC-02: returns unavailable when capacity is full', async () => {
    bookingsResult = {
      data: [{ adults: 18, children: 0 }],
      error: null,
    };
    const result = await checkCapacity(baseParams);
    expect(result.available).toBe(false);
    expect(result.maxCapacity).toBe(20);
  });

  // CC-03
  it('CC-03: returns available when exactly at capacity', async () => {
    bookingsResult = {
      data: [{ adults: 17, children: 0 }],
      error: null,
    };
    const result = await checkCapacity(baseParams);
    expect(result.available).toBe(true);
  });

  // CC-04
  it('CC-04: returns available when settings are unavailable (graceful fallback)', async () => {
    settingsResult = { data: null, error: { message: 'not found' } };
    const result = await checkCapacity(baseParams);
    expect(result.available).toBe(true);
  });

  // CC-05
  it('CC-05: returns available when bookings query errors (graceful fallback)', async () => {
    bookingsResult = { data: null, error: { message: 'query failed' } };
    const result = await checkCapacity(baseParams);
    expect(result.available).toBe(true);
  });

  // CC-06
  it('CC-06: returns available when max_capacity is not a number', async () => {
    settingsResult = { data: { key: 'max_capacity_persons', value: 'invalid' }, error: null };
    const result = await checkCapacity(baseParams);
    expect(result.available).toBe(true);
  });

  // CC-07
  it('CC-07: returns available when checkIn/checkOut are null', async () => {
    const result = await checkCapacity({ ...baseParams, checkIn: null, checkOut: null });
    expect(result.available).toBe(true);
  });

  // CC-08
  it('CC-08: sums adults and children from multiple overlapping bookings', async () => {
    bookingsResult = {
      data: [
        { adults: 8, children: 2 },
        { adults: 5, children: 3 },
      ],
      error: null,
    };
    // Existing: 8+2+5+3 = 18, new: 3+0 = 3, total: 21 > 20
    const result = await checkCapacity(baseParams);
    expect(result.available).toBe(false);
    expect(result.maxCapacity).toBe(20);
  });

  // CC-09
  it('CC-09: counts children in new guests toward capacity', async () => {
    bookingsResult = {
      data: [{ adults: 16, children: 0 }],
      error: null,
    };
    // Existing: 16, new: 2 adults + 3 children = 5, total: 21 > 20
    const result = await checkCapacity({ ...baseParams, adults: 2, children: 3 });
    expect(result.available).toBe(false);
  });
});
