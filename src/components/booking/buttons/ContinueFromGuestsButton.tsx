import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/bookingStore';
import { ArrowRight, Loader2, CalendarDays } from 'lucide-react';
import { checkCapacity } from '@/lib/capacityCheck';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

export function ContinueFromGuestsButton() {
  const { t } = useTranslation();
  const { booking, nextStep, setStep } = useBookingStore();
  const [isChecking, setIsChecking] = useState(false);
  const [showNoAvailability, setShowNoAvailability] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState<number | undefined>();

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
        setMaxCapacity(result.maxCapacity);
        setShowNoAvailability(true);
        return;
      }

      nextStep();
    } finally {
      setIsChecking(false);
    }
  };

  const handleChangeDates = () => {
    setShowNoAvailability(false);
    setStep(1);
  };

  return (
    <>
      <Button
        onClick={handleContinue}
        disabled={!canContinue || isChecking}
        className="btn-cta px-8"
      >
        {isChecking ? (
          <>
            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
            {t('booking.step2.noAvailability.checking', 'Verificando...')}
          </>
        ) : (
          <>
            {t('booking.next')}
            <ArrowRight className="ml-2 w-4 h-4" />
          </>
        )}
      </Button>

      <AlertDialog open={showNoAvailability} onOpenChange={setShowNoAvailability}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <CalendarDays className="w-5 h-5" />
              {t('booking.step2.noAvailability.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                {t('booking.step2.noAvailability.description', { maxCapacity })}
              </span>
              <span className="block font-medium text-foreground">
                {t('booking.step2.noAvailability.suggestion')}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('booking.step2.noAvailability.close')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangeDates} className="gap-2">
              <CalendarDays className="w-4 h-4" />
              {t('booking.step2.noAvailability.changeDates')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
