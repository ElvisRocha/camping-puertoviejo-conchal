import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SINPE_PHONE = '70163299';
const SINPE_NAME = 'elvis rocha';
const CRC_RATE = 500;

function crcFormat(n: number): string {
  const [int, dec] = n.toFixed(2).split('.');
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + dec;
}
const AMOUNT_TOLERANCE = 0.02; // ±2%
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

export const RECEIPT_STORAGE_KEY = 'camping-payment-receipt';

type UploadStatus = 'idle' | 'verifying' | 'verified' | 'error';

interface PaymentReceiptUploadProps {
  expectedAmount: number; // USD — pricing.total / 2
  onVerified: (verified: boolean) => void;
}

// Extract text from a file using local libs (no API cost)
async function extractText(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
    // Use the bundled worker via Vite's asset resolution
    const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
    GlobalWorkerOptions.workerSrc = workerUrl;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item: any) => item.str).join(' ') + ' ';
    }
    return fullText;
  } else {
    // Image: run Tesseract OCR with Spanish language data
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('spa', 1, {
      // Use CDN for language data — keeps bundle small
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    });
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    return text;
  }
}

function parseAmount(text: string): number | null {
  // Match ₡ followed by digits, dots and commas (Costa Rica colones format)
  // Examples: ₡14,500.00  ₡14.500,00  ₡14500
  const match = text.match(/₡\s*([\d][\d.,]*)/);
  if (!match) return null;
  let raw = match[1];
  // Determine whether commas or dots are thousands separators
  // If the last separator is a comma (e.g. 14.500,00) → European format
  const lastComma = raw.lastIndexOf(',');
  const lastDot = raw.lastIndexOf('.');
  if (lastComma > lastDot) {
    // European: 14.500,00 → remove dots, replace comma with dot
    raw = raw.replace(/\./g, '').replace(',', '.');
  } else {
    // American/mixed: 14,500.00 → remove commas
    raw = raw.replace(/,/g, '');
  }
  const value = parseFloat(raw);
  return isNaN(value) ? null : value;
}

function validate(
  text: string,
  expectedUSD: number
): { valid: boolean; mensaje: string } {
  const lower = text.toLowerCase();
  const digitsOnly = text.replace(/\D/g, '');

  const expectedCRC = Math.round(expectedUSD * CRC_RATE);
  const detectedAmount = parseAmount(text);

  const nameValid = lower.includes(SINPE_NAME);
  const phoneValid = digitsOnly.includes(SINPE_PHONE);
  const amountValid =
    detectedAmount !== null &&
    Math.abs(detectedAmount - expectedCRC) / expectedCRC <= AMOUNT_TOLERANCE;

  if (!nameValid)
    return { valid: false, mensaje: `Nombre no coincide (esperado: "Elvis Rocha")` };
  if (!phoneValid)
    return { valid: false, mensaje: `Número de celular no encontrado (esperado: 7016-3299)` };
  if (!amountValid) {
    const detected = detectedAmount !== null ? `₡${crcFormat(detectedAmount)}` : 'no detectado';
    return {
      valid: false,
      mensaje: `Monto no coincide (detectado: ${detected}, esperado: ₡${crcFormat(expectedCRC)}`,
    };
  }
  return { valid: true, mensaje: 'Comprobante verificado correctamente' };
}

export function PaymentReceiptUpload({ expectedAmount, onVerified }: PaymentReceiptUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<UploadStatus>('idle');
  const [fileName, setFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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

      try {
        const text = await extractText(file);
        const { valid, mensaje } = validate(text, expectedAmount);
        if (valid) {
          setStatus('verified');
          onVerified(true);
        } else {
          setErrorMessage(mensaje);
          setStatus('error');
          onVerified(false);
        }
      } catch (err) {
        console.error('Receipt OCR error:', err);
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
