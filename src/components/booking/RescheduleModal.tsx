import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useBookingStore } from '@/store/bookingStore';
import { lookupBookingByReference } from '@/lib/bookingApi';

interface RescheduleModalProps {
  open: boolean;
  onClose: () => void;
}

export function RescheduleModal({ open, onClose }: RescheduleModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setReschedulingData } = useBookingStore();

  const [referenceCode, setReferenceCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setReferenceCode('');
    setError(null);
    onClose();
  };

  const handleVerify = async () => {
    const trimmed = referenceCode.trim().toUpperCase();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);

    const { bookingId, bookingData, error: lookupError, errorType } = await lookupBookingByReference(trimmed);

    setIsLoading(false);

    if (lookupError || !bookingId || !bookingData) {
      if (errorType === 'not_found') {
        setError(t('reschedule.modal.errorNotFound'));
      } else if (errorType === 'cancelled') {
        setError(t('reschedule.modal.errorCancelled'));
      } else {
        setError(t('reschedule.modal.errorGeneral'));
      }
      return;
    }

    setReschedulingData(bookingId, trimmed, bookingData);
    handleClose();
    navigate('/book');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && referenceCode.trim()) {
      handleVerify();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-forest">
            {t('reschedule.modal.title')}
          </DialogTitle>
          <DialogDescription className="font-body text-muted-foreground">
            {t('reschedule.modal.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label
              htmlFor="reference-code"
              className="text-sm font-medium font-body text-foreground"
            >
              {t('reschedule.modal.label')}
            </label>
            <Input
              id="reference-code"
              value={referenceCode}
              onChange={(e) => {
                setReferenceCode(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t('reschedule.modal.placeholder')}
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
              {t('reschedule.modal.cancelButton')}
            </Button>
            <Button
              onClick={handleVerify}
              disabled={isLoading || !referenceCode.trim()}
              className="btn-cta font-body"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('reschedule.modal.loading')}
                </>
              ) : (
                t('reschedule.modal.verifyButton')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
