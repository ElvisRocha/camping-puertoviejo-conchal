import { describe, it, expect, beforeEach } from 'vitest';
import { useBookingStore } from '@/store/bookingStore';

describe('Booking Store Actions', () => {
  beforeEach(() => {
    useBookingStore.getState().resetBooking();
    useBookingStore.setState({ currentStep: 1 });
  });

  // BS-01
  it('BS-01: setDates calculates nights correctly', () => {
    const store = useBookingStore.getState();
    store.setDates(new Date(2026, 5, 1), new Date(2026, 5, 4));
    expect(useBookingStore.getState().booking.nights).toBe(3);
  });

  // BS-02
  it('BS-02: setDates with null resets nights to 0', () => {
    const store = useBookingStore.getState();
    store.setDates(new Date(2026, 5, 1), new Date(2026, 5, 4));
    store.setDates(null, null);
    expect(useBookingStore.getState().booking.nights).toBe(0);
  });

  // BS-03
  it('BS-03: addTent increments quantity for existing tent', () => {
    const store = useBookingStore.getState();
    store.addTent('tent-2');
    store.addTent('tent-2');
    const tents = useBookingStore.getState().booking.accommodation?.rentedTents;
    expect(tents?.find((t) => t.tentId === 'tent-2')?.quantity).toBe(2);
  });

  // BS-04
  it('BS-04: addTent creates new entry with quantity 1', () => {
    const store = useBookingStore.getState();
    store.addTent('tent-4');
    const tents = useBookingStore.getState().booking.accommodation?.rentedTents;
    expect(tents?.find((t) => t.tentId === 'tent-4')?.quantity).toBe(1);
  });

  // BS-05
  it('BS-05: removeTent decrements quantity when > 1', () => {
    const store = useBookingStore.getState();
    store.addTent('tent-2');
    store.addTent('tent-2');
    store.removeTent('tent-2');
    const tents = useBookingStore.getState().booking.accommodation?.rentedTents;
    expect(tents?.find((t) => t.tentId === 'tent-2')?.quantity).toBe(1);
  });

  // BS-06
  it('BS-06: removeTent removes tent when quantity = 1', () => {
    const store = useBookingStore.getState();
    store.addTent('tent-2');
    store.removeTent('tent-2');
    const tents = useBookingStore.getState().booking.accommodation?.rentedTents;
    expect(tents?.find((t) => t.tentId === 'tent-2')).toBeUndefined();
  });

  // BS-07
  it('BS-07: removeTent sets bringOwnTent=true when no tents left', () => {
    const store = useBookingStore.getState();
    store.addTent('tent-2');
    store.removeTent('tent-2');
    expect(useBookingStore.getState().booking.accommodation?.bringOwnTent).toBe(true);
  });

  // BS-08
  it('BS-08: setBringOwnTent(true) clears rentedTents', () => {
    const store = useBookingStore.getState();
    store.addTent('tent-4');
    store.addTent('tent-6');
    store.setBringOwnTent(true);
    expect(useBookingStore.getState().booking.accommodation?.rentedTents).toEqual([]);
  });

  // BS-09
  it('BS-09: toggleAddOn adds if not present', () => {
    const store = useBookingStore.getState();
    store.toggleAddOn('breakfast');
    expect(useBookingStore.getState().booking.addOns).toContain('breakfast');
  });

  // BS-10
  it('BS-10: toggleAddOn removes if already present', () => {
    const store = useBookingStore.getState();
    store.toggleAddOn('breakfast');
    store.toggleAddOn('breakfast');
    expect(useBookingStore.getState().booking.addOns).not.toContain('breakfast');
  });

  // BS-11
  it('BS-11: nextStep does not exceed 4', () => {
    useBookingStore.setState({ currentStep: 4 });
    useBookingStore.getState().nextStep();
    expect(useBookingStore.getState().currentStep).toBe(4);
  });

  // BS-12
  it('BS-12: prevStep does not go below 1', () => {
    useBookingStore.setState({ currentStep: 1 });
    useBookingStore.getState().prevStep();
    expect(useBookingStore.getState().currentStep).toBe(1);
  });

  // BS-13
  it('BS-13: goToStep only allows completed steps', () => {
    useBookingStore.setState({ currentStep: 3 });
    useBookingStore.getState().goToStep(2);
    expect(useBookingStore.getState().currentStep).toBe(2);
    // Trying to go forward should not work
    useBookingStore.getState().goToStep(4);
    expect(useBookingStore.getState().currentStep).toBe(2);
  });

  // BS-14
  it('BS-14: resetBooking clears all state and localStorage', () => {
    const store = useBookingStore.getState();
    store.setGuests({ adults: 3, children: 1, infants: 0 });
    store.toggleAddOn('kayak');
    store.resetBooking();
    const state = useBookingStore.getState();
    expect(state.booking.guests?.adults).toBe(0);
    expect(state.booking.addOns).toEqual([]);
    expect(localStorage.removeItem).toHaveBeenCalledWith('camping-booking-storage');
  });

  // BS-15
  it('BS-15: completeBooking generates CPVC-XXXXX reference code', () => {
    const store = useBookingStore.getState();
    const code = store.completeBooking();
    expect(code).toMatch(/^CPVC-[A-Z0-9]{5}$/);
  });

  // BS-16
  it('BS-16: addTent sets bringOwnTent to false', () => {
    const store = useBookingStore.getState();
    store.addTent('tent-2');
    expect(useBookingStore.getState().booking.accommodation?.bringOwnTent).toBe(false);
  });
});
