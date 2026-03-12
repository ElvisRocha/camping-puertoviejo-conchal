import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useBookingStore } from '@/store/bookingStore';
import { createBooking } from '@/lib/bookingApi';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Lock, Shield, Loader2, Tent } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { formatDualPrice } from '@/lib/priceFormat';
import { PaymentReceiptUpload, RECEIPT_STORAGE_KEY } from './PaymentReceiptUpload';

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
  const [receiptVerified, setReceiptVerified] = useState(false);
  const [depositCRC, setDepositCRC] = useState<number | null>(null);

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

    if (!receiptVerified) {
      toast({
        title: t('booking.step5.receiptUpload.error'),
        description: t('booking.step5.receiptUpload.receiptRequired'),
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Retrieve file from localStorage
      const storedReceipt = localStorage.getItem(RECEIPT_STORAGE_KEY);
      if (!storedReceipt) {
        throw new Error('Receipt not found in storage');
      }
      const { file: base64, fileName, fileType } = JSON.parse(storedReceipt);

      // 2. Convert base64 → Blob
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: fileType });

      // 3. Upload to Supabase Storage
      const storagePath = `${Date.now()}-${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(storagePath, blob, { contentType: fileType });

      if (uploadError) {
        throw uploadError;
      }

      // 4. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-receipts')
        .getPublicUrl(storagePath);

      // 5. Create booking with receipt URL and deposit amount
      const { referenceCode, error } = await createBooking({
        booking,
        pricing,
        paymentReceiptUrl: publicUrl,
        depositCRC: depositCRC ?? undefined,
      });

      if (error) {
        throw error;
      }

      // 6. Link receipt URL to booking record (client-side fallback in case
      //    the deployed edge function predates payment_receipt_url support)
      await supabase.rpc('link_payment_receipt', {
        ref_code: referenceCode,
        receipt_url: publicUrl,
      });

      // 7. Update deposit_amount and balance_due using the OCR-detected amount.
      //    Done client-side so it works regardless of which edge function version
      //    is deployed in production.
      const totalCRC = Math.round(pricing.total * 500);
      const deposit = depositCRC ?? Math.round((pricing.total / 2) * 500);
      const balance = Math.max(0, totalCRC - deposit);
      await supabase.rpc('update_booking_deposit', {
        ref_code: referenceCode,
        p_deposit: deposit,
        p_balance: balance,
      });

      // 8. Clear localStorage receipt
      localStorage.removeItem(RECEIPT_STORAGE_KEY);

      toast({
        title: t('booking.step5.toastSuccessTitle'),
        description: t('booking.step5.toastSuccessDescription', { code: referenceCode }),
      });

      onComplete(referenceCode);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: t('booking.step5.toastErrorTitle'),
        description: t('booking.step5.receiptUpload.uploadError'),
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
        <p className="text-4xl font-bold text-forest">{formatDualPrice(pricing.total, t('price_range_connector'))}</p>

        <hr className="my-4 border-border/40" />

        <p className="text-sm text-muted-foreground mb-1">{t('booking.step5.sinpePayment')}</p>
        <p className="text-xl font-semibold text-sea-green">{formatDualPrice(pricing.total / 2, t('price_range_connector'))}</p>

        <span className="inline-block mt-3 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-medium">
          {t('booking.step5.paymentBadge')}
        </span>
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
            <p className="text-sm font-medium text-forest leading-relaxed mt-1">
              {t('booking.step5.paymentInfo.body3')}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Receipt Upload */}
      <PaymentReceiptUpload
        expectedAmount={pricing.total / 2}
        onVerified={(verified, amount) => {
          setReceiptVerified(verified);
          setDepositCRC(amount ?? null);
        }}
      />

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
        disabled={!agreedToTerms || !receiptVerified || isProcessing}
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
