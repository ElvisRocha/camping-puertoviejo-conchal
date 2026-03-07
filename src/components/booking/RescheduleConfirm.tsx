import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, CalendarCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/bookingStore';
import { updateBooking } from '@/lib/bookingApi';
import { useToast } from '@/hooks/use-toast';
import { formatLocalizedDate } from '@/lib/dateLocale';
import { formatDualPrice } from '@/lib/priceFormat';
import { TENT_OPTIONS } from '@/types/booking';

interface RescheduleConfirmProps {
  onComplete: (referenceCode: string) => void;
}

export function RescheduleConfirm({ onComplete }: RescheduleConfirmProps) {
  const { t, i18n } = useTranslation();
  const { booking, calculatePricing, prevStep, rescheduleBookingId, rescheduleReferenceCode } = useBookingStore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const pricing = calculatePricing();
  const guests = booking.guests || { adults: 0, children: 0, infants: 0 };

  const handleConfirm = async () => {
    if (!rescheduleBookingId || !rescheduleReferenceCode) return;

    setIsProcessing(true);
    const { error } = await updateBooking({
      bookingId: rescheduleBookingId,
      booking,
      pricing,
    });
    setIsProcessing(false);

    if (error) {
      toast({
        title: t('reschedule.confirm.errorTitle'),
        description: t('reschedule.confirm.errorDescription'),
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('reschedule.confirm.successTitle'),
      description: t('reschedule.confirm.successDescription', { code: rescheduleReferenceCode }),
    });

    onComplete(rescheduleReferenceCode);
  };

  const rentedTents = booking.accommodation?.rentedTents || [];
  const bringOwnTent = booking.accommodation?.bringOwnTent ?? true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-section-title mb-2">{t('reschedule.confirm.title')}</h2>
        <p className="text-muted-foreground">{t('reschedule.confirm.subtitle')}</p>
      </div>

      {/* Reference code badge */}
      <div className="card-nature p-4 flex items-center justify-between bg-forest/5 border border-forest/20">
        <span className="text-sm font-body text-muted-foreground">{t('reschedule.confirm.keepingCode')}</span>
        <span className="font-heading font-bold text-forest tracking-widest">{rescheduleReferenceCode}</span>
      </div>

      {/* Summary */}
      <div className="card-nature p-6 space-y-4">
        <div className="flex items-center gap-2 text-forest font-heading font-semibold mb-2">
          <CalendarCheck className="w-5 h-5" />
          <span>{t('booking.step4.summary')}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm font-body">
          <div className="text-muted-foreground">{t('booking.step1.checkIn')}</div>
          <div className="font-medium">
            {booking.checkIn
              ? formatLocalizedDate(booking.checkIn, 'PPP', i18n.language)
              : '—'}
          </div>

          <div className="text-muted-foreground">{t('booking.step1.checkOut')}</div>
          <div className="font-medium">
            {booking.checkOut
              ? formatLocalizedDate(booking.checkOut, 'PPP', i18n.language)
              : '—'}
          </div>

          <div className="text-muted-foreground">{t('booking.step4.adults')}</div>
          <div className="font-medium">{guests.adults}</div>

          {guests.children > 0 && (
            <>
              <div className="text-muted-foreground">{t('booking.step4.children')}</div>
              <div className="font-medium">{guests.children}</div>
            </>
          )}

          <div className="text-muted-foreground">{t('booking.step4.accommodation')}</div>
          <div className="font-medium">
            {bringOwnTent
              ? t('booking.step4.bringOwnTent')
              : rentedTents.map((sel) => {
                  const tent = TENT_OPTIONS.find((o) => o.id === sel.tentId);
                  return tent ? `${sel.quantity}× ${t(tent.nameKey)}` : sel.tentId;
                }).join(', ')}
          </div>
        </div>

        <div className="border-t border-border pt-3 flex justify-between font-body">
          <span className="font-medium">{t('booking.step4.total')}</span>
          <span className="font-bold text-forest">{formatDualPrice(pricing.total, t('price_range_connector'))}</span>
        </div>
      </div>

      {/* Confirm button */}
      <Button
        onClick={handleConfirm}
        disabled={isProcessing}
        className="btn-cta w-full py-6 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
            {t('reschedule.confirm.processing')}
          </>
        ) : (
          t('reschedule.confirm.confirmButton')
        )}
      </Button>

      <div className="flex justify-start pt-2">
        <Button variant="outline" onClick={prevStep} disabled={isProcessing}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          {t('booking.back')}
        </Button>
      </div>
    </motion.div>
  );
}
