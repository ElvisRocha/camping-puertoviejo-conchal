import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const N8N_WEBHOOK_URL = 'https://n8n.smartflow-automations.com/webhook/escanear-recibo';
const SINPE_RECIPIENT_NAME = 'Elvis Rocha';
const SINPE_RECIPIENT_PHONE = '70163299';
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

export const RECEIPT_STORAGE_KEY = 'camping-payment-receipt';

type UploadStatus = 'idle' | 'verifying' | 'verified' | 'error';

interface PaymentReceiptUploadProps {
  expectedAmount: number;
  onVerified: (verified: boolean) => void;
}

export function PaymentReceiptUpload({ expectedAmount, onVerified }: PaymentReceiptUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<UploadStatus>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const resetState = () => {
    setStatus('idle');
    setFileName('');
    setErrorMessage('');
    onVerified(false);
    localStorage.removeItem(RECEIPT_STORAGE_KEY);
    if (inputRef.current) inputRef.current.value = '';
  };

  const processFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage(t('booking.step5.receiptUpload.fileTypeError'));
      setStatus('error');
      onVerified(false);
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(t('booking.step5.receiptUpload.fileSizeError'));
      setStatus('error');
      onVerified(false);
      return;
    }

    setFileName(file.name);
    setStatus('verifying');
    onVerified(false);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;

      // Save to localStorage
      localStorage.setItem(
        RECEIPT_STORAGE_KEY,
        JSON.stringify({ file: base64, fileName: file.name, fileType: file.type, fileSize: file.size })
      );

      // Send to n8n webhook for verification
      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: base64,
            fileName: file.name,
            fileType: file.type,
            montoEsperado: expectedAmount,
            nombreDestinatario: SINPE_RECIPIENT_NAME,
            celularDestino: SINPE_RECIPIENT_PHONE,
          }),
        });

        if (!response.ok) {
          throw new Error(`Webhook error: ${response.status}`);
        }

        const result = await response.json();

        if (result.datosCorrectos === true) {
          setStatus('verified');
          onVerified(true);
        } else {
          setErrorMessage(result.mensaje || t('booking.step5.receiptUpload.errorSubtitle'));
          setStatus('error');
          onVerified(false);
        }
      } catch (err) {
        console.error('Receipt verification error:', err);
        setErrorMessage(t('booking.step5.receiptUpload.errorSubtitle'));
        setStatus('error');
        onVerified(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="card-nature p-6 space-y-4">
      <div>
        <h3 className="font-heading font-bold text-lg text-forest">
          {t('booking.step5.receiptUpload.title')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('booking.step5.receiptUpload.subtitle')}
        </p>
      </div>

      {/* Idle / Drop zone */}
      {status === 'idle' && (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-forest bg-forest/5' : 'border-border hover:border-forest/50 hover:bg-forest/5'}
          `}
        >
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium text-sm">{t('booking.step5.receiptUpload.dropzone')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('booking.step5.receiptUpload.formats')}</p>
        </div>
      )}

      {/* Verifying state */}
      {status === 'verifying' && (
        <div className="border-2 border-dashed border-forest/30 rounded-lg p-8 text-center bg-forest/5">
          <Loader2 className="w-10 h-10 mx-auto mb-3 text-forest animate-spin" />
          <p className="font-medium text-sm text-forest">{t('booking.step5.receiptUpload.verifying')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('booking.step5.receiptUpload.verifyingSubtitle')}</p>
          {fileName && (
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span className="truncate max-w-[200px]">{fileName}</span>
            </div>
          )}
        </div>
      )}

      {/* Verified state */}
      {status === 'verified' && (
        <div className="border-2 border-green-500/40 rounded-lg p-6 bg-green-50 dark:bg-green-950/20">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-green-700 dark:text-green-400">
                {t('booking.step5.receiptUpload.verified')}
              </p>
              <p className="text-sm text-green-600/80 dark:text-green-500/80 mt-0.5">
                {t('booking.step5.receiptUpload.verifiedSubtitle')}
              </p>
              {fileName && (
                <div className="flex items-center gap-2 mt-2 text-xs text-green-600/70">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="truncate">{fileName}</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetState}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground"
          >
            {t('booking.step5.receiptUpload.changeFile')}
          </Button>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="border-2 border-destructive/40 rounded-lg p-6 bg-destructive/5">
          <div className="flex items-start gap-4">
            <XCircle className="w-8 h-8 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-destructive">
                {t('booking.step5.receiptUpload.error')}
              </p>
              <p className="text-sm text-destructive/80 mt-0.5">
                {errorMessage || t('booking.step5.receiptUpload.errorSubtitle')}
              </p>
              {fileName && (
                <div className="flex items-center gap-2 mt-2 text-xs text-destructive/60">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="truncate">{fileName}</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetState}
            className="mt-3 text-xs text-destructive hover:text-destructive"
          >
            {t('booking.step5.receiptUpload.changeFile')}
          </Button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
