import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/bookingStore';
import { ArrowRight, Lock, Loader2 } from 'lucide-react';

export function Step1NextButton() {
  const { t } = useTranslation();
  const { booking, nextStep } = useBookingStore();
  const canContinue = !!(booking.checkIn && booking.checkOut && booking.nights && booking.nights > 0);

  return (
    <Button
      onClick={nextStep}
      disabled={!canContinue}
      className="btn-cta px-8"
    >
      {t('booking.next')}
      <ArrowRight className="ml-2 w-4 h-4" />
    </Button>
  );
}

export function Step2NextButton() {
  const { t } = useTranslation();
  const { booking, nextStep } = useBookingStore();
  const guests = booking.guests || { adults: 0, children: 0 };
  const canContinue = (guests.adults + guests.children) > 0;

  return (
    <Button
      onClick={nextStep}
      disabled={!canContinue}
      className="btn-cta px-8"
    >
      {t('booking.next')}
      <ArrowRight className="ml-2 w-4 h-4" />
    </Button>
  );
}

interface Step4NextButtonProps {
  onClick: () => void;
}

export function Step4NextButton({ onClick }: Step4NextButtonProps) {
  const { t } = useTranslation();

  return (
    <Button onClick={onClick} className="btn-cta px-8">
      {t('booking.next')}
      <ArrowRight className="ml-2 w-4 h-4" />
    </Button>
  );
}

interface Step5CompleteButtonProps {
  onClick: () => void;
  disabled: boolean;
  isProcessing: boolean;
}

export function Step5CompleteButton({ onClick, disabled, isProcessing }: Step5CompleteButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="btn-cta w-full py-6 text-lg"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 w-5 h-5 animate-spin" />
          {t('booking.step5.processing')}
        </>
      ) : (
        <>
          <Lock className="mr-2 w-5 h-5" />
          {t('booking.step5.completeBooking')}
        </>
      )}
    </Button>
  );
}
