import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useBookingStore } from '@/store/bookingStore';
import { createBooking } from '@/lib/bookingApi';
import { ArrowLeft, CreditCard, Lock, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Step5PaymentProps {
  onComplete: (referenceCode: string) => void;
}

export function Step5Payment({ onComplete }: Step5PaymentProps) {
  const { t } = useTranslation();
  const { booking, calculatePricing, prevStep } = useBookingStore();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const pricing = calculatePricing();

  const handleCompleteBooking = async () => {
    if (!agreedToTerms) {
      toast({
        title: 'Please agree to terms',
        description: 'You must agree to the Terms & Conditions to complete your booking.',
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
        title: 'Booking Confirmed! 🎉',
        description: `Your reference code is ${referenceCode}`,
      });

      onComplete(referenceCode);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: 'There was an error processing your booking. Please try again.',
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
        <p className="text-muted-foreground mb-1">Total to pay</p>
        <p className="text-4xl font-bold text-forest">${pricing.total.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground mt-1">USD, including taxes</p>
      </div>

      {/* Payment Method */}
      <div className="card-nature p-6 space-y-4">
        <h3 className="font-heading font-bold text-lg">{t('booking.step5.paymentMethod')}</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setPaymentMethod('card')}
            className={cn(
              'p-4 rounded-xl border-2 transition-all flex items-center gap-3',
              paymentMethod === 'card'
                ? 'border-forest bg-forest/10'
                : 'border-border hover:border-forest/50'
            )}
          >
            <CreditCard className="w-6 h-6 text-forest" />
            <span className="font-medium">{t('booking.step5.cardPayment')}</span>
          </button>
          
          <button
            onClick={() => setPaymentMethod('paypal')}
            className={cn(
              'p-4 rounded-xl border-2 transition-all flex items-center gap-3',
              paymentMethod === 'paypal'
                ? 'border-forest bg-forest/10'
                : 'border-border hover:border-forest/50'
            )}
          >
            <span className="text-xl font-bold text-[#003087]">P</span>
            <span className="font-medium">{t('booking.step5.paypal')}</span>
          </button>
        </div>

        {/* Card Form Placeholder */}
        {paymentMethod === 'card' && (
          <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-dashed border-border">
            <p className="text-center text-muted-foreground text-sm">
              💳 Payment integration ready for Stripe
              <br />
              <span className="text-xs">(Demo mode - booking will be saved without charge)</span>
            </p>
          </div>
        )}

        {paymentMethod === 'paypal' && (
          <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-dashed border-border">
            <p className="text-center text-muted-foreground text-sm">
              🅿️ PayPal integration ready
              <br />
              <span className="text-xs">(Demo mode - booking will be saved without charge)</span>
            </p>
          </div>
        )}
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

        {/* Cancellation Policy */}
        <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          📋 {t('booking.step5.cancellationPolicy')}
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
            Processing...
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
