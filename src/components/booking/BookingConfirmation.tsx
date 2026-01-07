import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/bookingStore';
import { SITE_CONFIG } from '@/types/booking';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Mail, 
  MessageCircle, 
  ListChecks, 
  Plane, 
  Calendar,
  Share2,
  Home
} from 'lucide-react';
import { formatLocalizedDate } from '@/lib/dateLocale';

interface BookingConfirmationProps {
  referenceCode: string;
}

export function BookingConfirmation({ referenceCode }: BookingConfirmationProps) {
  const { t, i18n } = useTranslation();
  const { booking, calculatePricing, resetBooking } = useBookingStore();
  const pricing = calculatePricing();

  const addToGoogleCalendar = () => {
    const checkIn = booking.checkIn ? new Date(booking.checkIn) : new Date();
    const checkOut = booking.checkOut ? new Date(booking.checkOut) : new Date();
    
    const startDate = format(checkIn, "yyyyMMdd");
    const endDate = format(checkOut, "yyyyMMdd");
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Camping Puerto Viejo Conchal')}&dates=${startDate}/${endDate}&details=${encodeURIComponent(`Booking Reference: ${referenceCode}`)}&location=${encodeURIComponent(SITE_CONFIG.location)}`;
    
    window.open(url, '_blank');
  };

  const shareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Costa Rica Camping Adventure!',
        text: `I just booked a camping trip at ${SITE_CONFIG.brandName}! 🏕️🌴`,
        url: window.location.origin,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-6"
      >
        <CheckCircle2 className="w-20 h-20 text-forest mx-auto" />
      </motion.div>

      <h1 className="text-section-title mb-4">{t('booking.confirmation.title')}</h1>

      {/* Reference Code */}
      <div className="card-nature p-6 mb-6">
        <p className="text-sm text-muted-foreground mb-2">{t('booking.confirmation.reference')}</p>
        <p className="text-3xl font-bold text-forest font-mono">{referenceCode}</p>
        <p className="text-sm text-muted-foreground mt-4">
          {t('booking.confirmation.emailSent')}: <span className="font-medium">{booking.guestInfo?.email}</span>
        </p>
      </div>

      {/* Booking Summary */}
      <div className="card-nature p-6 mb-6 text-left">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t('booking.confirmation.checkIn')}</p>
            <p className="font-semibold">
              {booking.checkIn && formatLocalizedDate(booking.checkIn, 'PPPP', i18n.language)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('booking.confirmation.checkOut')}</p>
            <p className="font-semibold">
              {booking.checkOut && formatLocalizedDate(booking.checkOut, 'PPPP', i18n.language)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('booking.confirmation.guests')}</p>
            <p className="font-semibold">
              {(booking.guests?.adults || 0) + (booking.guests?.children || 0)} {t('booking.confirmation.guestsLabel')}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('booking.confirmation.totalPaid')}</p>
            <p className="font-semibold text-forest">${pricing.total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="card-nature p-6 mb-6 text-left">
        <h3 className="font-heading font-bold text-lg mb-4">{t('booking.confirmation.whatsNext')}</h3>
        <div className="space-y-4">
          {[
            { icon: Mail, text: t('booking.confirmation.step1') },
            { icon: MessageCircle, text: `${t('booking.confirmation.step2')}: ${SITE_CONFIG.whatsapp}` },
            { icon: ListChecks, text: t('booking.confirmation.step3') },
            { icon: Plane, text: t('booking.confirmation.step4') },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center">
                <step.icon className="w-4 h-4 text-forest" />
              </div>
              <p className="text-sm">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
        <Button onClick={addToGoogleCalendar} variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" />
          {t('booking.confirmation.addToCalendar')}
        </Button>
        <Button onClick={shareBooking} variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          {t('booking.confirmation.shareTitle')}
        </Button>
      </div>

      {/* Back Home */}
      <Link to="/" onClick={resetBooking}>
        <Button className="btn-cta gap-2">
          <Home className="w-4 h-4" />
          {t('booking.confirmation.backHome')}
        </Button>
      </Link>

      {/* Contact */}
      <p className="mt-6 text-sm text-muted-foreground">
        {t('booking.confirmation.questionsTitle')} <a href={`mailto:${SITE_CONFIG.email}`} className="text-forest hover:underline">{SITE_CONFIG.email}</a>
      </p>
    </motion.div>
  );
}
