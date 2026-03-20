import { describe, it, expect } from 'vitest';
import { useBookingStore } from '@/store/bookingStore';

describe('Reference Code Generation', () => {
  it('generates a code matching CPVC-XXXXX format', () => {
    const store = useBookingStore.getState();
    const code = store.completeBooking();
    expect(code).toMatch(/^CPVC-[A-Z0-9]{5}$/);
  });

  it('generates unique codes on successive calls', () => {
    const store = useBookingStore.getState();
    const codes = new Set<string>();
    for (let i = 0; i < 20; i++) {
      codes.add(store.completeBooking());
    }
    // With 36^5 possibilities, 20 codes should all be unique
    expect(codes.size).toBe(20);
  });
});
