import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/bookingStore';
import { isBefore, startOfDay, parse, isValid, format } from 'date-fns';
import { CalendarIcon, ArrowRight, X } from 'lucide-react';
import { Step1NextButton } from './StepNextButtons';
import { motion } from 'framer-motion';
import { getDateLocale, getWeekStartsOn, formatLocalizedDate } from '@/lib/dateLocale';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type SelectionPhase = 'checkIn' | 'checkOut';

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

function parseDateInput(text: string): Date | null {
  if (text.length !== 10) return null;
  const parsed = parse(text, 'dd/MM/yyyy', new Date());
  if (!isValid(parsed)) return null;
  // Verify round-trip to catch things like 32/01/2026
  if (format(parsed, 'dd/MM/yyyy') !== text) return null;
  return parsed;
}

function dateToText(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd/MM/yyyy');
}

export function Step1Dates() {
  const { t, i18n } = useTranslation();
  const { booking, setDates, nextStep } = useBookingStore();
  const isMobile = useIsMobile();
  const [selectionPhase, setSelectionPhase] = useState<SelectionPhase>('checkIn');
  const [checkInText, setCheckInText] = useState(dateToText(booking.checkIn));
  const [checkOutText, setCheckOutText] = useState(dateToText(booking.checkOut));
  const [checkInError, setCheckInError] = useState(false);
  const [checkOutError, setCheckOutError] = useState(false);
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);

  const today = startOfDay(new Date());
  const currentLocale = getDateLocale(i18n.language);
  const weekStartsOn = getWeekStartsOn(i18n.language);

  const checkInDate = booking.checkIn ? new Date(booking.checkIn) : undefined;
  const checkOutDate = booking.checkOut ? new Date(booking.checkOut) : undefined;

  // Sync text fields when calendar selection changes
  useEffect(() => {
    setCheckInText(dateToText(booking.checkIn));
  }, [booking.checkIn]);

  useEffect(() => {
    setCheckOutText(dateToText(booking.checkOut));
  }, [booking.checkOut]);

  const handleDayClick = (day: Date) => {
    if (isBefore(day, today)) return;

    if (selectionPhase === 'checkIn') {
      setDates(day, null);
      setSelectionPhase('checkOut');
    } else {
      if (checkInDate && isBefore(day, checkInDate)) {
        setDates(day, null);
        setSelectionPhase('checkOut');
      } else if (checkInDate) {
        setDates(checkInDate, day);
      }
    }
  };

  const handleInputChange = (phase: SelectionPhase, value: string) => {
    const formatted = formatDateInput(value);
    if (phase === 'checkIn') {
      setCheckInText(formatted);
      setCheckInError(false);
    } else {
      setCheckOutText(formatted);
      setCheckOutError(false);
    }
  };

  const validateAndApply = (phase: SelectionPhase) => {
    const text = phase === 'checkIn' ? checkInText : checkOutText;
    if (text === '') return; // empty is fine, means cleared

    const parsed = parseDateInput(text);
    if (!parsed || isBefore(parsed, today)) {
      if (phase === 'checkIn') {
        setCheckInError(true);
        setCheckInText(dateToText(booking.checkIn));
        setTimeout(() => setCheckInError(false), 1500);
      } else {
        setCheckOutError(true);
        setCheckOutText(dateToText(booking.checkOut));
        setTimeout(() => setCheckOutError(false), 1500);
      }
      return;
    }

    if (phase === 'checkIn') {
      // If checkOut exists and new checkIn >= checkOut, clear checkOut
      if (checkOutDate && !isBefore(parsed, checkOutDate)) {
        setDates(parsed, null);
        setSelectionPhase('checkOut');
      } else {
        setDates(parsed, checkOutDate || null);
        setSelectionPhase('checkOut');
      }
    } else {
      if (checkInDate && isBefore(parsed, checkInDate)) {
        setCheckOutError(true);
        setCheckOutText(dateToText(booking.checkOut));
        setTimeout(() => setCheckOutError(false), 1500);
        return;
      }
      setDates(checkInDate || null, parsed);
    }
  };

  const handleKeyDown = (phase: SelectionPhase, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateAndApply(phase);
    }
  };

  const handleClearCheckIn = () => {
    setDates(null, null);
    setCheckInText('');
    setCheckOutText('');
    setSelectionPhase('checkIn');
    checkInRef.current?.focus();
  };

  const handleClearCheckOut = () => {
    setDates(checkInDate || null, null);
    setCheckOutText('');
    setSelectionPhase('checkOut');
    checkOutRef.current?.focus();
  };

  const handleClearDates = () => {
    setDates(null, null);
    setCheckInText('');
    setCheckOutText('');
    setSelectionPhase('checkIn');
  };

  const canContinue = booking.checkIn && booking.checkOut && booking.nights && booking.nights > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-section-title mb-2">{t('booking.step1.title')}</h2>
        <p className="text-muted-foreground">{t('booking.step1.subtitle')}</p>
        <p className="text-forest font-semibold mt-2">{t('booking.step1.priceNote')}</p>
      </div>

      {/* Editable date inputs */}
      <div className="flex justify-center gap-4 mb-2">
        <div
          className={cn(
            "flex-1 max-w-[200px] rounded-xl border-2 p-3 transition-all relative",
            selectionPhase === 'checkIn'
              ? "border-forest bg-forest/5 shadow-sm"
              : "border-border bg-background hover:border-forest/40",
            checkInError && "border-destructive bg-destructive/5"
          )}
          onClick={() => {
            setSelectionPhase('checkIn');
            checkInRef.current?.focus();
          }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('booking.step1.checkIn')}
          </span>
          <div className="flex items-center gap-1 mt-1">
            <input
              ref={checkInRef}
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder={t('booking.step1.datePlaceholder')}
              value={checkInText}
              onChange={(e) => handleInputChange('checkIn', e.target.value)}
              onBlur={() => validateAndApply('checkIn')}
              onKeyDown={(e) => handleKeyDown('checkIn', e)}
              onFocus={() => setSelectionPhase('checkIn')}
              className="bg-transparent border-none outline-none text-sm font-medium w-full text-foreground placeholder:text-muted-foreground"
            />
            {checkInText && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClearCheckIn(); }}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div
          className={cn(
            "flex-1 max-w-[200px] rounded-xl border-2 p-3 transition-all relative",
            selectionPhase === 'checkOut'
              ? "border-forest bg-forest/5 shadow-sm"
              : "border-border bg-background hover:border-forest/40",
            !checkInDate && "opacity-50 cursor-not-allowed",
            checkOutError && "border-destructive bg-destructive/5"
          )}
          onClick={() => {
            if (checkInDate) {
              setSelectionPhase('checkOut');
              checkOutRef.current?.focus();
            }
          }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('booking.step1.checkOut')}
          </span>
          <div className="flex items-center gap-1 mt-1">
            <input
              ref={checkOutRef}
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder={t('booking.step1.datePlaceholder')}
              value={checkOutText}
              onChange={(e) => handleInputChange('checkOut', e.target.value)}
              onBlur={() => validateAndApply('checkOut')}
              onKeyDown={(e) => handleKeyDown('checkOut', e)}
              onFocus={() => { if (checkInDate) setSelectionPhase('checkOut'); }}
              disabled={!checkInDate}
              className="bg-transparent border-none outline-none text-sm font-medium w-full text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed"
            />
            {checkOutText && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClearCheckOut(); }}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="card-nature p-4 md:p-6 inline-block">
          <Calendar
            mode="range"
            selected={{
              from: checkInDate,
              to: checkOutDate,
            }}
            onDayClick={handleDayClick}
            numberOfMonths={isMobile ? 1 : 2}
            disabled={(date) => isBefore(date, today)}
            locale={currentLocale}
            weekStartsOn={weekStartsOn}
            className="rounded-xl"
          />

          {(checkInDate || checkOutDate) && (
            <div className="flex justify-end mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearDates}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                {t('booking.step1.clearDates')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {booking.checkIn && booking.checkOut && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 bg-forest/10 rounded-xl"
        >
          <div className="flex items-center justify-center gap-4 text-lg">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-forest" />
              <span className="font-semibold">
                {formatLocalizedDate(booking.checkIn, 'PPP', i18n.language)}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-forest" />
              <span className="font-semibold">
                {formatLocalizedDate(booking.checkOut, 'PPP', i18n.language)}
              </span>
            </div>
          </div>
          <p className="text-forest font-medium mt-2">
            {booking.nights} {t('booking.step4.nights')}
          </p>
        </motion.div>
      )}

      <div className="flex justify-end pt-4">
        <Step1NextButton />
      </div>
    </motion.div>
  );
}
