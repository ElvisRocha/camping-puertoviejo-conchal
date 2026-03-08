import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useBookingStore } from '@/store/bookingStore';
import { createBooking } from '@/lib/bookingApi';
import { ArrowLeft, Lock, Shield, Loader2, Tent, Upload, CheckCircle2, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { formatDualPrice } from '@/lib/priceFormat';
import { supabase } from '@/integrations/supabase/client';

interface Step5PaymentProps {
  onComplete: (referenceCode: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export function Step5Payment({ onComplete }: Step5PaymentProps) {
  const { t } = useTranslation();
  const { booking, calculatePricing, prevStep } = useBookingStore();
  const { toast } = useToast();

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Receipt upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pricing = calculatePricing();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        title: t('booking.step5.receipt.error'),
        description: t('booking.step5.receipt.formats'),
        variant: 'destructive',
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: t('booking.step5.receipt.error'),
        description: t('booking.step5.receipt.maxSize'),
        variant: 'destructive',
      });
      return;
    }

    setReceiptFile(file);

    // Preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }

    // Upload to storage
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(fileName, file, { contentType: file.type, upsert: false });

      if (uploadError) throw uploadError;

      // Store the path (not public URL since bucket is private)
      setReceiptUrl(fileName);

      toast({
        title: t('booking.step5.receipt.uploaded'),
      });
    } catch (err) {
      console.error('Upload error:', err);
      setReceiptFile(null);
      setReceiptPreview(null);
      toast({
        title: t('booking.step5.receipt.error'),
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCompleteBooking = async () => {
    if (!agreedToTerms) {
      toast({
        title: t('booking.step5.termsRequiredTitle'),
        description: t('booking.step5.termsRequired'),
        variant: 'destructive',
      });
      return;
    }

    if (!receiptUrl) {
      toast({
        title: t('booking.step5.receipt.title'),
        description: t('booking.step5.receipt.required'),
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { referenceCode, error } = await createBooking({
        booking,
        pricing,
        paymentReceiptUrl: receiptUrl,
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
        <p className="text-4xl font-bold text-forest">{formatDualPrice(pricing.total, t('price_range_connector'))}</p>
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
      <div className="card-nature p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Upload className="w-5 h-5 text-forest" />
          <h3 className="font-heading font-bold text-lg">{t('booking.step5.receipt.title')}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t('booking.step5.receipt.description')}</p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {receiptUrl ? (
          <div className="flex items-center gap-4 p-4 rounded-lg bg-forest/5 border border-forest/20">
            {receiptPreview ? (
              <img src={receiptPreview} alt="Receipt" className="w-16 h-16 object-cover rounded-md border" />
            ) : (
              <div className="w-16 h-16 rounded-md border bg-muted flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-forest font-medium text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {t('booking.step5.receipt.uploaded')}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{receiptFile?.name}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {t('booking.step5.receipt.changeButton')}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full py-8 border-dashed border-2 hover:border-forest/40 hover:bg-forest/5 transition-colors"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                {t('booking.step5.receipt.uploading')}
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm font-medium">{t('booking.step5.receipt.uploadButton')}</span>
                <span className="text-xs text-muted-foreground">{t('booking.step5.receipt.formats')}</span>
              </div>
            )}
          </Button>
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
      </div>

      {/* Complete Booking Button */}
      <Button
        onClick={handleCompleteBooking}
        disabled={!agreedToTerms || !receiptUrl || isProcessing}
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
