import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/bookingStore';
import { ArrowRight } from 'lucide-react';

export function ContinueFromGuestsButton() {
  const { booking, nextStep } = useBookingStore();
  const guests = booking.guests || { adults: 0, children: 0 };
  const canContinue = (guests.adults + guests.children) > 0;

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
