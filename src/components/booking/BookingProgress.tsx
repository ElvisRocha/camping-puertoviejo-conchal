import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { number: 1, label: 'Dates' },
  { number: 2, label: 'Guests' },
  { number: 3, label: 'Extras' },
  { number: 4, label: 'Details' },
  { number: 5, label: 'Confirm' },
];

export function BookingProgress({ currentStep, totalSteps }: BookingProgressProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.slice(0, totalSteps).map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                  currentStep > step.number
                    ? 'bg-forest text-white'
                    : currentStep === step.number
                    ? 'bg-forest text-white ring-4 ring-forest/20'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium hidden sm:block',
                  currentStep >= step.number
                    ? 'text-forest'
                    : 'text-muted-foreground'
                )}
              >
                {step.label}
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
        ))}
      </div>
    </div>
  );
}
