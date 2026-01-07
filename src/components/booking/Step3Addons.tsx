import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/bookingStore';
import { ADD_ONS } from '@/types/booking';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Step3Addons() {
  const { t } = useTranslation();
  const { booking, toggleAddOn, prevStep, nextStep } = useBookingStore();

  const isSelected = (id: string) => booking.addOns?.includes(id) || false;

  const getPriceLabel = (addon: typeof ADD_ONS[0]) => {
    switch (addon.priceType) {
      case 'per-person':
        return `$${addon.price}/person`;
      case 'per-night':
        return `$${addon.price}/night`;
      case 'per-day':
        return `$${addon.price}/day`;
      case 'flat':
        return `$${addon.price}`;
      default:
        return `$${addon.price}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-section-title mb-2">{t('booking.step3.title')}</h2>
        <p className="text-muted-foreground">{t('booking.step3.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {ADD_ONS.map((addon, index) => (
          <motion.button
            key={addon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => toggleAddOn(addon.id)}
            className={cn(
              'p-4 rounded-xl border-2 transition-all text-left group',
              isSelected(addon.id)
                ? 'border-forest bg-forest/10'
                : 'border-border hover:border-forest/50'
            )}
          >
            <div className="flex gap-4">
              <div className="relative">
                <img
                  src={addon.image}
                  alt={addon.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                {isSelected(addon.id) && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-forest rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold">{addon.icon} {addon.name}</h4>
                  <span className="font-bold text-forest">{getPriceLabel(addon)}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{addon.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          {t('booking.back')}
        </Button>
        <Button onClick={nextStep} className="btn-cta px-8">
          {t('booking.next')}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
