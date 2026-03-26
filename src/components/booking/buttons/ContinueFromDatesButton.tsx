import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/bookingStore';
import { ArrowRight } from 'lucide-react';

export function ContinueFromDatesButton() {
  const { booking, nextStep } = useBookingStore();
  const canContinue = !!(booking.checkIn && booking.checkOut && booking.nights && booking.nights > 0);

  return (
    <Button
      onClick={nextStep}
      disabled={!canContinue}
      className="btn-cta px-8"
    >
      Continuar
      <ArrowRight className="ml-2 w-4 h-4" />
    </Button>
  );
}
