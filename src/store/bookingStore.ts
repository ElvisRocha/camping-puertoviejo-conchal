import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Booking, TentSelection, GuestInfo, PricingBreakdown } from '@/types/booking';
import { PRICING, TENT_OPTIONS, ADD_ONS } from '@/types/booking';
import { differenceInDays } from 'date-fns';

interface BookingState {
  currentStep: number;
  booking: Partial<Booking>;
  
  // Actions
  setStep: (step: number) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Date selection
  setDates: (checkIn: Date | null, checkOut: Date | null) => void;
  
  // Guest selection
  setGuests: (guests: { adults: number; children: number; infants: number }) => void;
  
  // Accommodation
  setBringOwnTent: (value: boolean) => void;
  setRentedTents: (tents: TentSelection[]) => void;
  addTent: (tentId: string) => void;
  removeTent: (tentId: string) => void;
  
  // Add-ons
  toggleAddOn: (addOnId: string) => void;
  
  // Guest info
  setGuestInfo: (info: Partial<GuestInfo>) => void;
  
  // Pricing
  calculatePricing: () => PricingBreakdown;
  
  // Reset
  resetBooking: () => void;
  
  // Complete booking
  completeBooking: () => string;
}

const generateReferenceCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'CPVC-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const initialBooking: Partial<Booking> = {
  checkIn: null,
  checkOut: null,
  nights: 0,
  guests: { adults: 2, children: 0, infants: 0 },
  accommodation: { bringOwnTent: true, rentedTents: [] },
  addOns: [],
  guestInfo: {
    fullName: '',
    email: '',
    phone: '',
    country: '',
    arrivalTime: '',
    specialRequests: '',
    celebratingOccasion: '',
  },
  status: 'pending',
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      booking: { ...initialBooking },

      setStep: (step) => set({ currentStep: step }),
      goToStep: (step) => {
        // Only allow going to steps that have been completed (step < currentStep)
        const { currentStep } = get();
        if (step >= 1 && step < currentStep) {
          set({ currentStep: step });
        }
      },
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

      setDates: (checkIn, checkOut) => {
        const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
        set((state) => ({
          booking: { ...state.booking, checkIn, checkOut, nights },
        }));
      },

      setGuests: (guests) => {
        set((state) => ({
          booking: { ...state.booking, guests },
        }));
      },

      setBringOwnTent: (value) => {
        set((state) => ({
          booking: {
            ...state.booking,
            accommodation: {
              ...state.booking.accommodation!,
              bringOwnTent: value,
              rentedTents: value ? [] : state.booking.accommodation?.rentedTents || [],
            },
          },
        }));
      },

      setRentedTents: (tents) => {
        set((state) => ({
          booking: {
            ...state.booking,
            accommodation: { ...state.booking.accommodation!, rentedTents: tents },
          },
        }));
      },

      addTent: (tentId) => {
        set((state) => {
          const currentTents = state.booking.accommodation?.rentedTents || [];
          const existing = currentTents.find((t) => t.tentId === tentId);
          
          let newTents: TentSelection[];
          if (existing) {
            newTents = currentTents.map((t) =>
              t.tentId === tentId ? { ...t, quantity: t.quantity + 1 } : t
            );
          } else {
            newTents = [...currentTents, { tentId, quantity: 1 }];
          }
          
          return {
            booking: {
              ...state.booking,
              accommodation: {
                bringOwnTent: false,
                rentedTents: newTents,
              },
            },
          };
        });
      },

      removeTent: (tentId) => {
        set((state) => {
          const currentTents = state.booking.accommodation?.rentedTents || [];
          const existing = currentTents.find((t) => t.tentId === tentId);
          
          if (!existing) return state;
          
          let newTents: TentSelection[];
          if (existing.quantity > 1) {
            newTents = currentTents.map((t) =>
              t.tentId === tentId ? { ...t, quantity: t.quantity - 1 } : t
            );
          } else {
            newTents = currentTents.filter((t) => t.tentId !== tentId);
          }
          
          return {
            booking: {
              ...state.booking,
              accommodation: {
                bringOwnTent: newTents.length === 0,
                rentedTents: newTents,
              },
            },
          };
        });
      },

      toggleAddOn: (addOnId) => {
        set((state) => {
          const currentAddOns = state.booking.addOns || [];
          const newAddOns = currentAddOns.includes(addOnId)
            ? currentAddOns.filter((id) => id !== addOnId)
            : [...currentAddOns, addOnId];
          
          return {
            booking: { ...state.booking, addOns: newAddOns },
          };
        });
      },

      setGuestInfo: (info) => {
        set((state) => ({
          booking: {
            ...state.booking,
            guestInfo: { ...state.booking.guestInfo!, ...info },
          },
        }));
      },

      calculatePricing: () => {
        const { booking } = get();
        const nights = booking.nights || 0;
        const guests = booking.guests || { adults: 0, children: 0, infants: 0 };
        const totalGuests = guests.adults + guests.children;
        
        // Campsite fee
        const campsiteFee = totalGuests * PRICING.campsitePerPersonPerNight * nights;
        
        // Tent rental
        let tentRental = 0;
        if (!booking.accommodation?.bringOwnTent) {
          booking.accommodation?.rentedTents?.forEach((selection) => {
            const tent = TENT_OPTIONS.find((t) => t.id === selection.tentId);
            if (tent) {
              tentRental += tent.pricePerNight * selection.quantity * nights;
            }
          });
        }
        
        // Add-ons
        let addOnsTotal = 0;
        booking.addOns?.forEach((addOnId) => {
          const addOn = ADD_ONS.find((a) => a.id === addOnId);
          if (addOn) {
            switch (addOn.priceType) {
              case 'per-person':
                addOnsTotal += addOn.price * totalGuests;
                break;
              case 'per-day':
              case 'per-night':
                addOnsTotal += addOn.price * nights;
                break;
              case 'flat':
                addOnsTotal += addOn.price;
                break;
            }
          }
        });
        
        const subtotal = campsiteFee + tentRental + addOnsTotal;
        const taxes = subtotal * PRICING.taxRate;
        const total = subtotal + taxes;
        
        return {
          campsiteFee,
          tentRental,
          addOns: addOnsTotal,
          subtotal,
          taxes,
          total,
          nights,
        };
      },

      resetBooking: () => {
        set({
          currentStep: 1,
          booking: { ...initialBooking },
        });
      },

      completeBooking: () => {
        const referenceCode = generateReferenceCode();
        set((state) => ({
          booking: {
            ...state.booking,
            referenceCode,
            id: crypto.randomUUID(),
            status: 'confirmed',
            pricing: get().calculatePricing(),
          },
        }));
        return referenceCode;
      },
    }),
    {
      name: 'camping-booking-storage',
      partialize: (state) => ({ booking: state.booking }),
    }
  )
);
