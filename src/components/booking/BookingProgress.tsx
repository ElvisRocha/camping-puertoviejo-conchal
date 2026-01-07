import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBookingStore } from '@/store/bookingStore';

interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function BookingProgress({ currentStep, totalSteps }: BookingProgressProps) {
  const { t } = useTranslation();
  const { goToStep } = useBookingStore();

  const steps = [
    { number: 1, labelKey: 'booking.steps.dates' },
    { number: 2, labelKey: 'booking.steps.guests' },
    { number: 3, labelKey: 'booking.steps.extras' },
    { number: 4, labelKey: 'booking.steps.details' },
    { number: 5, labelKey: 'booking.steps.confirm' },
  ];

  const handleStepClick = (stepNumber: number) => {
    // Only allow clicking on completed steps (steps before current)
    if (stepNumber < currentStep) {
      goToStep(stepNumber);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.slice(0, totalSteps).map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = isCompleted;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.number)}
                  disabled={!isClickable}
                  aria-label={`${t(step.labelKey)} - ${isCompleted ? t('booking.steps.completed') : isCurrent ? t('booking.steps.current') : t('booking.steps.upcoming')}`}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                    isCompleted
                      ? 'bg-forest text-white cursor-pointer hover:bg-forest/90 hover:scale-105 focus:ring-2 focus:ring-forest focus:ring-offset-2'
                      : isCurrent
                      ? 'bg-forest text-white ring-4 ring-forest/20 cursor-default'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </button>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium hidden sm:block transition-colors',
                    isCurrent
                      ? 'text-forest font-semibold'
                      : isCompleted
                      ? 'text-forest cursor-pointer hover:text-forest/80'
                      : 'text-muted-foreground'
                  )}
                  onClick={() => handleStepClick(step.number)}
                >
                  {t(step.labelKey)}
                </span>
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2 rounded-full transition-all duration-300',
                    currentStep > step.number ? 'bg-forest' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
