import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock supabase client before importing bookingApi
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    storage: { from: vi.fn() },
    rpc: vi.fn(),
  },
}));

// We need to mock global fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

import { createBooking, lookupBookingByReference, cancelBooking, updateBooking } from '@/lib/bookingApi';
import type { PricingBreakdown } from '@/types/booking';

const mockPricing: PricingBreakdown = {
  campsiteFee: 84,
  tentRental: 50,
  addOns: 36,
  subtotal: 170,
  taxes: 0,
  total: 170,
  nights: 3,
};

const mockBooking = {
  checkIn: new Date(2026, 5, 1),
  checkOut: new Date(2026, 5, 4),
  guests: { adults: 2, children: 1, infants: 0 },
  accommodation: { bringOwnTent: false, rentedTents: [{ tentId: 'tent-4', quantity: 1 }] },
  addOns: ['breakfast'],
  guestInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    phone: '+1234567890',
    country: 'United States',
  },
};

describe('Booking API Layer', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  // API-01
  it('API-01: createBooking success returns referenceCode', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referenceCode: 'CPVC-AB123' }),
    });
    const result = await createBooking({ booking: mockBooking, pricing: mockPricing });
    expect(result.referenceCode).toBe('CPVC-AB123');
    expect(result.error).toBeNull();
  });

  // API-02
  it('API-02: createBooking HTTP 400 returns error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Check-in and check-out dates are required' }),
    });
    const result = await createBooking({ booking: {}, pricing: mockPricing });
    expect(result.referenceCode).toBe('');
    expect(result.error).toBeInstanceOf(Error);
  });

  // API-03
  it('API-03: createBooking network failure returns error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const result = await createBooking({ booking: mockBooking, pricing: mockPricing });
    expect(result.referenceCode).toBe('');
    expect(result.error).toBeInstanceOf(Error);
  });

  // API-04
  it('API-04: lookupBooking found + confirmed', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        found: true,
        booking: {
          id: 'uuid-123',
          check_in: '2026-06-01',
          check_out: '2026-06-04',
          adults: 2,
          children: 1,
          infants: 0,
          bring_own_tent: false,
          status: 'confirmed',
        },
        tents: [{ tent_type: 'tent-4', quantity: 1 }],
        addons: [{ addon_type: 'breakfast' }],
        guest_info: {
          full_name: 'John Doe',
          email: 'john@test.com',
          phone: '+1234567890',
          country: 'United States',
        },
      }),
    });
    const result = await lookupBookingByReference('CPVC-AB123');
    expect(result.bookingId).toBe('uuid-123');
    expect(result.bookingData).toBeDefined();
    expect(result.error).toBeNull();
  });

  // API-05
  it('API-05: lookupBooking not found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ found: false }),
    });
    const result = await lookupBookingByReference('CPVC-XXXXX');
    expect(result.errorType).toBe('not_found');
  });

  // API-06
  it('API-06: lookupBooking cancelled status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        found: true,
        booking: { id: 'uuid-123', check_in: '2026-06-01', check_out: '2026-06-04', adults: 1, children: 0, infants: 0, bring_own_tent: true, status: 'cancelled' },
        tents: [],
        addons: [],
        guest_info: { full_name: 'Test', email: 'test@test.com', phone: '123', country: 'US' },
      }),
    });
    const result = await lookupBookingByReference('CPVC-AB123');
    expect(result.errorType).toBe('cancelled');
  });

  // API-07
  it('API-07: lookupBooking normalizes reference to uppercase', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ found: false }),
    });
    await lookupBookingByReference('cpvc-abc12');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.referenceCode).toBe('CPVC-ABC12');
  });

  // API-08
  it('API-08: cancelBooking success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const result = await cancelBooking('uuid-123');
    expect(result.error).toBeNull();
  });

  // API-09
  it('API-09: updateBooking success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const result = await updateBooking({ bookingId: 'uuid-123', booking: mockBooking, pricing: mockPricing });
    expect(result.error).toBeNull();
  });

  // API-10
  it('API-10: lookupBooking parses full_name into firstName + lastName', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        found: true,
        booking: { id: 'uuid-123', check_in: '2026-06-01', check_out: '2026-06-04', adults: 1, children: 0, infants: 0, bring_own_tent: true, status: 'confirmed' },
        tents: [],
        addons: [],
        guest_info: { full_name: 'John Doe Smith', email: 'j@t.com', phone: '123', country: 'US' },
      }),
    });
    const result = await lookupBookingByReference('CPVC-AB123');
    expect(result.bookingData?.guestInfo?.firstName).toBe('John');
    expect(result.bookingData?.guestInfo?.lastName).toBe('Doe Smith');
  });
});
