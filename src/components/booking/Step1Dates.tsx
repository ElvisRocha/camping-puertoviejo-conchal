import { useTranslation } from 'react-i18next';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/bookingStore';
import { isBefore, startOfDay } from 'date-fns';
import { CalendarIcon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDateLocale, getWeekStartsOn, formatLocalizedDate } from '@/lib/dateLocale';

export function Step1Dates() {
  const { t, i18n } = useTranslation();
  const { booking, setDates, nextStep } = useBookingStore();
  
  const today = startOfDay(new Date());
  const currentLocale = getDateLocale(i18n.language);
  const weekStartsOn = getWeekStartsOn(i18n.language);
  
  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setDates(range.from, range.to);
    } else if (range?.from) {
      setDates(range.from, null);
    }
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

      <div className="flex justify-center">
        <div className="card-nature p-4 md:p-6 inline-block">
          <Calendar
            mode="range"
            selected={{
              from: booking.checkIn ? new Date(booking.checkIn) : undefined,
              to: booking.checkOut ? new Date(booking.checkOut) : undefined,
            }}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={(date) => isBefore(date, today)}
            locale={currentLocale}
            weekStartsOn={weekStartsOn}
            className="rounded-xl"
          />
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
