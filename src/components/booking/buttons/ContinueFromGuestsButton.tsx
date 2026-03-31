import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/bookingStore';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { checkCapacity } from '@/lib/capacityCheck';

export function ContinueFromGuestsButton() {
  const { booking, nextStep } = useBookingStore();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const guests = booking.guests || { adults: 0, children: 0 };
  const canContinue = (guests.adults + guests.children) > 0;

  const handleContinue = async () => {
    setIsChecking(true);
    try {
      const result = await checkCapacity({
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        adults: guests.adults ?? 0,
        children: guests.children ?? 0,
      });

      if (!result.available) {
        toast({
          variant: 'destructive',
          title: 'Sin disponibilidad',
          description: `No hay disponibilidad para las fechas seleccionadas. El camping ha alcanzado su capacidad máxima de ${result.maxCapacity} personas.`,
        });
        return;
      }

      nextStep();
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Button
      onClick={handleContinue}
      disabled={!canContinue || isChecking}
      className="btn-cta px-8"
    >
      {isChecking ? (
        <>
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          Verificando...
        </>
      ) : (
        <>
          Continuar
          <ArrowRight className="ml-2 w-4 h-4" />
        </>
      )}
    </Button>
  );
}
