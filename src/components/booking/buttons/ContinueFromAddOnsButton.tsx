import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/bookingStore';
import { ArrowRight } from 'lucide-react';

export function ContinueFromAddOnsButton() {
  const { nextStep } = useBookingStore();

  return (
    <Button onClick={nextStep} className="btn-cta px-8">
      Continuar
      <ArrowRight className="ml-2 w-4 h-4" />
    </Button>
  );
}
