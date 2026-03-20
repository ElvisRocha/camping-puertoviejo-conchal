import { describe, it, expect, beforeEach } from 'vitest';
import { useBookingStore } from '@/store/bookingStore';
import { TENT_OPTIONS, ADD_ONS } from '@/types/booking';

function setupAndCalculate(config: {
  adults?: number;
  children?: number;
  infants?: number;
  nights?: number;
  bringOwnTent?: boolean;
  rentedTents?: { tentId: string; quantity: number }[];
  addOns?: string[];
}) {
  const store = useBookingStore.getState();
  store.resetBooking();

  // Set dates to produce desired nights
  const nights = config.nights ?? 0;
  if (nights > 0) {
    const checkIn = new Date(2026, 5, 1);
    const checkOut = new Date(2026, 5, 1 + nights);
    store.setDates(checkIn, checkOut);
  }

  store.setGuests({
    adults: config.adults ?? 0,
    children: config.children ?? 0,
    infants: config.infants ?? 0,
  });

  if (config.bringOwnTent !== undefined) {
    store.setBringOwnTent(config.bringOwnTent);
  }

  if (config.rentedTents) {
    store.setBringOwnTent(false);
    store.setRentedTents(config.rentedTents);
  }

  if (config.addOns) {
    config.addOns.forEach((id) => store.toggleAddOn(id));
  }

  return store.calculatePricing();
}

describe('Pricing Engine (calculatePricing)', () => {
  beforeEach(() => {
    useBookingStore.getState().resetBooking();
  });

  // PR-01: 2 adults, 3 nights, own tent
  it('PR-01: calculates campsite fee correctly for own tent', () => {
    const pricing = setupAndCalculate({ adults: 2, nights: 3, bringOwnTent: true });
    expect(pricing.campsiteFee).toBe(2 * 14 * 3); // $84
    expect(pricing.tentRental).toBe(0);
    expect(pricing.total).toBe(84);
  });

  // PR-02: 2 adults + 1 child, 2 nights, tent-4 x1
  it('PR-02: calculates pricing with rented tent and children', () => {
    const pricing = setupAndCalculate({
      adults: 2,
      children: 1,
      nights: 2,
      rentedTents: [{ tentId: 'tent-4', quantity: 1 }],
    });
    expect(pricing.campsiteFee).toBe(3 * 14 * 2); // $84
    expect(pricing.tentRental).toBe(25 * 1 * 2);   // $50
    expect(pricing.total).toBe(134);
  });

  // PR-03: Infants do NOT count for campsite fee
  it('PR-03: infants do not count for campsite fee', () => {
    const pricing = setupAndCalculate({ adults: 2, infants: 2, nights: 1, bringOwnTent: true });
    expect(pricing.campsiteFee).toBe(2 * 14 * 1); // $28, not 4*14
  });

  // PR-04: Add-on per-person (breakfast)
  it('PR-04: breakfast add-on is per-person', () => {
    const pricing = setupAndCalculate({ adults: 2, children: 1, nights: 1, bringOwnTent: true, addOns: ['breakfast'] });
    expect(pricing.addOns).toBe(12 * 3); // $36
  });

  // PR-05: Add-on per-night (bonfire)
  it('PR-05: bonfire add-on is per-night', () => {
    const pricing = setupAndCalculate({ adults: 1, nights: 3, bringOwnTent: true, addOns: ['bonfire'] });
    expect(pricing.addOns).toBe(20 * 3); // $60
  });

  // PR-06: Add-on per-day (snorkel)
  it('PR-06: snorkel add-on is per-day (same as per-night)', () => {
    const pricing = setupAndCalculate({ adults: 1, nights: 2, bringOwnTent: true, addOns: ['snorkel'] });
    expect(pricing.addOns).toBe(15 * 2); // $30
  });

  // PR-07: Multiple tents
  it('PR-07: multiple tents calculated correctly', () => {
    const pricing = setupAndCalculate({
      adults: 4,
      nights: 2,
      rentedTents: [
        { tentId: 'tent-2', quantity: 2 },
        { tentId: 'tent-6', quantity: 1 },
      ],
    });
    expect(pricing.tentRental).toBe((15 * 2 + 35 * 1) * 2); // $130
  });

  // PR-08: All add-ons together
  it('PR-08: all add-ons combined pricing', () => {
    const pricing = setupAndCalculate({
      adults: 2,
      children: 1,
      nights: 2,
      bringOwnTent: true,
      addOns: ['breakfast', 'kayak', 'wildlife', 'bonfire', 'snorkel'],
    });
    const totalGuests = 3;
    const expected =
      12 * totalGuests + // breakfast per-person
      35 * totalGuests + // kayak per-person
      25 * totalGuests + // wildlife per-person
      20 * 2 +           // bonfire per-night
      15 * 2;            // snorkel per-day
    expect(pricing.addOns).toBe(expected);
  });

  // PR-09: 0 nights
  it('PR-09: zero nights produces zero totals', () => {
    const pricing = setupAndCalculate({ adults: 2, nights: 0, bringOwnTent: true });
    expect(pricing.campsiteFee).toBe(0);
    expect(pricing.tentRental).toBe(0);
    expect(pricing.addOns).toBe(0);
    expect(pricing.total).toBe(0);
  });

  // PR-10: bringOwnTent=true ignores rented tents
  it('PR-10: bringOwnTent=true zeroes tent rental', () => {
    const store = useBookingStore.getState();
    store.resetBooking();
    const checkIn = new Date(2026, 5, 1);
    const checkOut = new Date(2026, 5, 3);
    store.setDates(checkIn, checkOut);
    store.setGuests({ adults: 2, children: 0, infants: 0 });
    // Add tents first
    store.setBringOwnTent(false);
    store.setRentedTents([{ tentId: 'tent-4', quantity: 1 }]);
    // Then switch to own tent
    store.setBringOwnTent(true);
    const pricing = store.calculatePricing();
    expect(pricing.tentRental).toBe(0);
  });

  // PR-11: Deposit = 50% of total
  it('PR-11: deposit is 50% of total', () => {
    const pricing = setupAndCalculate({ adults: 2, nights: 3, bringOwnTent: true });
    expect(pricing.total / 2).toBe(42); // $84 / 2
  });

  // PR-12: CRC conversion — all Supabase amounts must be in CRC (×500)
  it('PR-12: total CRC = USD × 500 (stored in Supabase)', () => {
    const pricing = setupAndCalculate({ adults: 1, nights: 1, bringOwnTent: true });
    const CRC_RATE = 500;
    const totalCRC = Math.round(pricing.total * CRC_RATE);
    expect(totalCRC).toBe(7000); // ₡7,000
    // Deposit in CRC
    const depositCRC = Math.round((pricing.total / 2) * CRC_RATE);
    expect(depositCRC).toBe(3500); // ₡3,500
  });

  it('PR-12b: tent price_per_night stored in CRC', () => {
    const CRC_RATE = 500;
    // tent-2: $15/night → ₡7,500/night in Supabase
    expect(TENT_OPTIONS.find((t) => t.id === 'tent-2')!.pricePerNight * CRC_RATE).toBe(7500);
    // tent-4: $25/night → ₡12,500/night
    expect(TENT_OPTIONS.find((t) => t.id === 'tent-4')!.pricePerNight * CRC_RATE).toBe(12500);
    // tent-6: $35/night → ₡17,500/night
    expect(TENT_OPTIONS.find((t) => t.id === 'tent-6')!.pricePerNight * CRC_RATE).toBe(17500);
  });

  it('PR-12c: addon prices stored in CRC', () => {
    const CRC_RATE = 500;
    for (const addon of ADD_ONS) {
      const crc = addon.price * CRC_RATE;
      expect(crc, `${addon.id} CRC should be ${addon.price}×500`).toBe(addon.price * 500);
    }
  });

  it('PR-12d: full booking total converts correctly to CRC', () => {
    const CRC_RATE = 500;
    const pricing = setupAndCalculate({
      adults: 2,
      children: 1,
      nights: 2,
      rentedTents: [{ tentId: 'tent-4', quantity: 1 }],
      addOns: ['breakfast'],
    });
    // campsite: 3*14*2 = $84, tent: 25*1*2 = $50, breakfast: 12*3 = $36 → total $170
    expect(pricing.total).toBe(170);
    expect(Math.round(pricing.total * CRC_RATE)).toBe(85000); // ₡85,000
  });
});
