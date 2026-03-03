import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useBookingStore } from '@/store/bookingStore';
import { createBooking } from '@/lib/bookingApi';
import { ArrowLeft, Lock, Shield, Loader2, Tent } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { formatDualPrice } from '@/lib/priceFormat';

interface Step5PaymentProps {
  onComplete: (referenceCode: string) => void;
}

export function Step5Payment({ onComplete }: Step5PaymentProps) {
  const { t } = useTranslation();
  const { booking, calculatePricing, prevStep } = useBookingStore();
  const { toast } = useToast();

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const pricing = calculatePricing();

  const handleCompleteBooking = async () => {
    if (!agreedToTerms) {
      toast({
        title: t('booking.step5.termsRequiredTitle'),
        description: t('booking.step5.termsRequired'),
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { referenceCode, error } = await createBooking({
        booking,
        pricing,
      });

      if (error) {
        throw error;
      }

      toast({
        title: t('booking.step5.toastSuccessTitle'),
        description: t('booking.step5.toastSuccessDescription', { code: referenceCode }),
      });

      onComplete(referenceCode);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: t('booking.step5.toastErrorTitle'),
        description: t('booking.step5.toastErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-section-title mb-2">{t('booking.step5.title')}</h2>
        <p className="text-muted-foreground">{t('booking.step5.subtitle')}</p>
      </div>

      {/* Total */}
      <div className="card-nature p-6 text-center">
        <p className="text-muted-foreground mb-1">{t('booking.step5.totalToPay')}</p>
        <p className="text-4xl font-bold text-forest">{formatDualPrice(pricing.total, t('common.or'))}</p>
        
      </div>

      {/* Informative block — payment on arrival */}
      <div className="card-nature p-6 bg-forest/5 border border-forest/20">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex-shrink-0">
            <Tent className="w-8 h-8 text-forest" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-lg text-forest">
              {t('booking.step5.paymentInfo.title')}
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {t('booking.step5.paymentInfo.body1')}
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {t('booking.step5.paymentInfo.body2')}
            </p>
          </div>
        </div>
      </div>

      {/* Terms & Newsletter */}
      <div className="card-nature p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
          />
          <label htmlFor="terms" className="text-sm cursor-pointer">
            {t('booking.step5.agreeTerms')}
          </label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="newsletter"
            checked={newsletter}
            onCheckedChange={(checked) => setNewsletter(checked as boolean)}
          />
          <label htmlFor="newsletter" className="text-sm cursor-pointer">
            {t('booking.step5.newsletter')}
          </label>
        </div>
      </div>

      {/* Complete Booking Button */}
      <Button
        onClick={handleCompleteBooking}
        disabled={!agreedToTerms || isProcessing}
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

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Lock className="w-4 h-4" />
          {t('booking.step5.secureNote')}
        </div>
        <div className="flex items-center gap-1">
          <Shield className="w-4 h-4" />
          {t('booking.step5.trustedBy')}
        </div>
      </div>

      <div className="flex justify-start pt-4">
        <Button variant="outline" onClick={prevStep} disabled={isProcessing}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          {t('booking.back')}
        </Button>
      </div>
    </motion.div>
  );
}
