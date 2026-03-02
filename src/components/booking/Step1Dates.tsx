import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/bookingStore';
import { isBefore, startOfDay } from 'date-fns';
import { CalendarIcon, ArrowRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDateLocale, getWeekStartsOn, formatLocalizedDate } from '@/lib/dateLocale';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type SelectionPhase = 'checkIn' | 'checkOut';

export function Step1Dates() {
  const { t, i18n } = useTranslation();
  const { booking, setDates, nextStep } = useBookingStore();
  const isMobile = useIsMobile();
  const [selectionPhase, setSelectionPhase] = useState<SelectionPhase>(
    booking.checkIn ? 'checkOut' : 'checkIn'
  );

  const today = startOfDay(new Date());
  const currentLocale = getDateLocale(i18n.language);
  const weekStartsOn = getWeekStartsOn(i18n.language);

  const checkInDate = booking.checkIn ? new Date(booking.checkIn) : undefined;
  const checkOutDate = booking.checkOut ? new Date(booking.checkOut) : undefined;

  const handleDayClick = (day: Date) => {
    if (isBefore(day, today)) return;

    if (selectionPhase === 'checkIn') {
      setDates(day, null);
      setSelectionPhase('checkOut');
    } else {
      // checkOut phase
      if (checkInDate && isBefore(day, checkInDate)) {
        // Clicked before checkIn → restart with this as new checkIn
        setDates(day, null);
        setSelectionPhase('checkOut');
      } else if (checkInDate) {
        setDates(checkInDate, day);
      }
    }
  };

  const handleClearDates = () => {
    setDates(null, null);
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

      {/* Date input indicators */}
      <div className="flex justify-center gap-4 mb-2">
        <button
          type="button"
          onClick={() => setSelectionPhase('checkIn')}
          className={cn(
            "flex-1 max-w-[200px] rounded-xl border-2 p-3 text-left transition-all",
            selectionPhase === 'checkIn'
              ? "border-forest bg-forest/5 shadow-sm"
              : "border-border bg-background hover:border-forest/40"
          )}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('booking.step1.checkIn')}
          </span>
          <p className={cn(
            "text-sm font-medium mt-1",
            checkInDate ? "text-foreground" : "text-muted-foreground"
          )}>
            {checkInDate
              ? formatLocalizedDate(checkInDate, 'PP', i18n.language)
              : t('booking.step1.selectCheckIn')
            }
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            if (checkInDate) setSelectionPhase('checkOut');
          }}
          className={cn(
            "flex-1 max-w-[200px] rounded-xl border-2 p-3 text-left transition-all",
            selectionPhase === 'checkOut'
              ? "border-forest bg-forest/5 shadow-sm"
              : "border-border bg-background hover:border-forest/40",
            !checkInDate && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('booking.step1.checkOut')}
          </span>
          <p className={cn(
            "text-sm font-medium mt-1",
            checkOutDate ? "text-foreground" : "text-muted-foreground"
          )}>
            {checkOutDate
              ? formatLocalizedDate(checkOutDate, 'PP', i18n.language)
              : t('booking.step1.selectCheckOut')
            }
          </p>
        </button>
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

          {/* Clear dates button */}
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
        <Button
          onClick={nextStep}
          disabled={!canContinue}
          className="btn-cta px-8"
        >
          {t('booking.next')}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
