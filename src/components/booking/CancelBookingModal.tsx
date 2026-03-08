import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle, AlertTriangle, CalendarX, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { lookupBookingByReference, cancelBooking } from '@/lib/bookingApi';
import { formatLocalizedDate } from '@/lib/dateLocale';
import { formatDualPrice } from '@/lib/priceFormat';
import { useBookingStore } from '@/store/bookingStore';
import type { Booking } from '@/types/booking';

interface CancelBookingModalProps {
  open: boolean;
  onClose: () => void;
  onReschedule?: () => void;
}

type ModalStep = 'lookup' | 'confirm' | 'success';

interface BookingSummary {
  id: string;
  referenceCode: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  total: number;
}

export function CancelBookingModal({ open, onClose, onReschedule }: CancelBookingModalProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setReschedulingData } = useBookingStore();

  const [step, setStep] = useState<ModalStep>('lookup');
  const [referenceCode, setReferenceCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null);
  const lookupBookingDataRef = useRef<Partial<Booking> | null>(null);

  const handleClose = () => {
    setReferenceCode('');
    setError(null);
    setStep('lookup');
    setBookingSummary(null);
    lookupBookingDataRef.current = null;
    onClose();
  };

  const handleLookup = async () => {
    const trimmed = referenceCode.trim().toUpperCase();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);

    const { bookingId, bookingData, error: lookupError, errorType } = await lookupBookingByReference(trimmed);

    setIsLoading(false);

    if (lookupError || !bookingId || !bookingData) {
      if (errorType === 'not_found') {
        setError(t('cancelBooking.modal.errorNotFound'));
      } else if (errorType === 'cancelled') {
        setError(t('cancelBooking.modal.errorAlreadyCancelled'));
      } else {
        setError(t('cancelBooking.modal.errorGeneral'));
      }
      return;
    }

    lookupBookingDataRef.current = bookingData;
    setBookingSummary({
      id: bookingId,
      referenceCode: trimmed,
      checkIn: bookingData.checkIn!,
      checkOut: bookingData.checkOut!,
      adults: bookingData.guests?.adults ?? 0,
      children: bookingData.guests?.children ?? 0,
      total: 0,
    });
    setStep('confirm');
  };

  const handleConfirmCancel = async () => {
    if (!bookingSummary) return;

    setIsLoading(true);
    setError(null);

    const { error: cancelError } = await cancelBooking(bookingSummary.id);

    setIsLoading(false);

    if (cancelError) {
      setError(t('cancelBooking.confirm.errorDescription'));
      return;
    }

    setStep('success');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && referenceCode.trim()) {
      handleLookup();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        {step === 'lookup' && (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl text-forest">
                {t('cancelBooking.modal.title')}
              </DialogTitle>
              <DialogDescription className="font-body text-muted-foreground">
                {t('cancelBooking.modal.subtitle')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label
                  htmlFor="cancel-reference-code"
                  className="text-sm font-medium font-body text-foreground"
                >
                  {t('cancelBooking.modal.label')}
                </label>
                <Input
                  id="cancel-reference-code"
                  value={referenceCode}
                  onChange={(e) => {
                    setReferenceCode(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={t('cancelBooking.modal.placeholder')}
                  className={`font-body uppercase tracking-widest ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span className="font-body">{error}</span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="font-body"
                >
                  {t('cancelBooking.modal.closeButton')}
                </Button>
                <Button
                  onClick={handleLookup}
                  disabled={isLoading || !referenceCode.trim()}
                  className="btn-cta font-body"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('cancelBooking.modal.loading')}
                    </>
                  ) : (
                    t('cancelBooking.modal.verifyButton')
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'confirm' && bookingSummary && (
          <>
            {/* Back arrow button in top-right area */}
            <button
              onClick={() => { setStep('lookup'); setError(null); }}
              disabled={isLoading}
              className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <DialogHeader className="pt-6 text-center sm:text-center">
              <DialogTitle className="font-heading text-xl text-destructive">
                <span className="inline">
                  <AlertTriangle className="h-5 w-5 inline-block align-middle mr-1 -mt-0.5" />
                  {t('cancelBooking.confirm.title')}
                </span>
              </DialogTitle>
              <DialogDescription className="font-body text-muted-foreground">
                {t('cancelBooking.confirm.subtitle')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Booking summary */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body text-muted-foreground">
                    {t('cancelBooking.confirm.referenceCode')}
                  </span>
                  <span className="font-heading font-bold tracking-widest text-forest">
                    {bookingSummary.referenceCode}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm font-body">
                  <span className="text-muted-foreground">{t('cancelBooking.confirm.checkIn')}</span>
                  <span className="font-medium">
                    {formatLocalizedDate(bookingSummary.checkIn, 'PPP', i18n.language)}
                  </span>
                  <span className="text-muted-foreground">{t('cancelBooking.confirm.checkOut')}</span>
                  <span className="font-medium">
                    {formatLocalizedDate(bookingSummary.checkOut, 'PPP', i18n.language)}
                  </span>
                  <span className="text-muted-foreground">{t('cancelBooking.confirm.guests')}</span>
                  <span className="font-medium">
                    {bookingSummary.adults} {t('booking.step4.adults').toLowerCase()}
                    {bookingSummary.children > 0 && `, ${bookingSummary.children} ${t('booking.step4.children').toLowerCase()}`}
                  </span>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-700/40">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div className="font-body space-y-2">
                  <span>{t('cancelBooking.confirm.warning')}</span>
                  <p>{t('cancelBooking.confirm.noRefund')}</p>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span className="font-body">{error}</span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {onReschedule && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (bookingSummary && lookupBookingDataRef.current) {
                        setReschedulingData(bookingSummary.id, bookingSummary.referenceCode, lookupBookingDataRef.current);
                        handleClose();
                        navigate('/book');
                      } else if (onReschedule) {
                        handleClose();
                        onReschedule();
                      }
                    }}
                    disabled={isLoading}
                    className="font-body"
                  >
                    {t('cancelBooking.confirm.rescheduleButton')}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={handleConfirmCancel}
                  disabled={isLoading}
                  className="font-body"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('cancelBooking.confirm.processing')}
                    </>
                  ) : (
                    t('cancelBooking.confirm.confirmButton')
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl text-forest flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                {t('cancelBooking.success.title')}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <p className="font-body text-muted-foreground">
                {t('cancelBooking.success.description', { code: bookingSummary?.referenceCode })}
              </p>

              <div className="flex justify-end">
                <Button onClick={handleClose} className="btn-cta font-body">
                  {t('cancelBooking.success.closeButton')}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}