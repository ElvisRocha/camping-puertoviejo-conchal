import { Button } from '@/components/ui/button';
import { Lock, Loader2 } from 'lucide-react';

interface CompleteBookingButtonProps {
  onClick: () => void;
  disabled: boolean;
  isProcessing: boolean;
}

export function CompleteBookingButton({ onClick, disabled, isProcessing }: CompleteBookingButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="btn-cta w-full py-6 text-lg"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 w-5 h-5 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <Lock className="mr-2 w-5 h-5" />
          Completar Reserva
        </>
      )}
    </Button>
  );
}
