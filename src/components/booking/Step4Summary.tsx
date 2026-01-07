import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBookingStore } from '@/store/bookingStore';
import { TENT_OPTIONS, ADD_ONS, COUNTRIES } from '@/types/booking';
import { ArrowLeft, ArrowRight, Calendar, Users, Tent, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { z } from 'zod';
import { useState } from 'react';

const guestInfoSchema = z.object({
  fullName: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().min(5, 'Phone is required').max(30),
  country: z.string().min(1, 'Country is required'),
});

export function Step4Summary() {
  const { t } = useTranslation();
  const { booking, calculatePricing, setGuestInfo, prevStep, nextStep } = useBookingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pricing = calculatePricing();
  const guests = booking.guests || { adults: 0, children: 0, infants: 0 };
  const guestInfo = booking.guestInfo || {
    fullName: '',
    email: '',
    phone: '',
    country: '',
    arrivalTime: '',
    specialRequests: '',
    celebratingOccasion: '',
  };

  const handleInputChange = (field: string, value: string) => {
    setGuestInfo({ [field]: value });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateAndContinue = () => {
    const result = guestInfoSchema.safeParse({
      fullName: guestInfo.fullName,
      email: guestInfo.email,
      phone: guestInfo.phone,
      country: guestInfo.country,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-section-title mb-2">{t('booking.step4.title')}</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking Summary */}
        <div className="card-nature p-6 space-y-4">
          <h3 className="font-heading font-bold text-xl mb-4">{t('booking.step4.summary')}</h3>

          {/* Dates */}
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <Calendar className="w-5 h-5 text-forest" />
            <div>
              <p className="font-medium">{t('booking.step4.dates')}</p>
              <p className="text-sm text-muted-foreground">
                {booking.checkIn && format(new Date(booking.checkIn), 'MMM dd')} → {booking.checkOut && format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                <span className="ml-2 text-forest">({booking.nights} {t('booking.step4.nights')})</span>
              </p>
            </div>
          </div>

          {/* Guests */}
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <Users className="w-5 h-5 text-forest" />
            <div>
              <p className="font-medium">{t('booking.step4.guests')}</p>
              <p className="text-sm text-muted-foreground">
                {guests.adults} {t('booking.step4.adults')}, {guests.children} {t('booking.step4.children')}
                {guests.infants > 0 && `, ${guests.infants} ${t('booking.step4.infants')}`}
              </p>
            </div>
          </div>

          {/* Accommodation */}
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <Tent className="w-5 h-5 text-forest" />
            <div>
              <p className="font-medium">{t('booking.step4.accommodation')}</p>
              {booking.accommodation?.bringOwnTent ? (
                <p className="text-sm text-muted-foreground">{t('booking.step4.bringOwnTent')}</p>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {booking.accommodation?.rentedTents?.map(selection => {
                    const tent = TENT_OPTIONS.find(t => t.id === selection.tentId);
                    return tent && (
                      <p key={selection.tentId}>{t(tent.nameKey)} x{selection.quantity}</p>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Add-ons */}
          {booking.addOns && booking.addOns.length > 0 && (
            <div className="flex items-start gap-3 pb-3 border-b border-border/50">
              <Sparkles className="w-5 h-5 text-forest mt-0.5" />
              <div>
                <p className="font-medium">{t('booking.step4.addonsLabel')}</p>
                <div className="text-sm text-muted-foreground">
                  {booking.addOns.map(id => {
                    const addon = ADD_ONS.find(a => a.id === id);
                    return addon && <p key={id}>{addon.icon} {t(addon.nameKey)}</p>;
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span>{t('booking.step4.campsite')}</span>
              <span>${pricing.campsiteFee.toFixed(2)}</span>
            </div>
            {pricing.tentRental > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t('booking.step4.tentRental')}</span>
                <span>${pricing.tentRental.toFixed(2)}</span>
              </div>
            )}
            {pricing.addOns > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t('booking.step4.addons')}</span>
                <span>${pricing.addOns.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-2 border-t border-border/50">
              <span>{t('booking.step4.subtotal')}</span>
              <span>${pricing.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t('booking.step4.taxes')}</span>
              <span>${pricing.taxes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span>{t('booking.step4.total')}</span>
              <span className="text-forest">${pricing.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Guest Information */}
        <div className="card-nature p-6">
          <h3 className="font-heading font-bold text-xl mb-4">{t('booking.step4.guestInfo.title')}</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('booking.step4.guestInfo.fullName')} *</label>
              <Input
                value={guestInfo.fullName || ''}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="John Doe"
                className={errors.fullName ? 'border-destructive' : ''}
              />
              {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('booking.step4.guestInfo.email')} *</label>
              <Input
                type="email"
                value={guestInfo.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@example.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('booking.step4.guestInfo.phone')} *</label>
              <Input
                value={guestInfo.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 555-123-4567"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('booking.step4.guestInfo.country')} *</label>
              <Select
                value={guestInfo.country || ''}
                onValueChange={(value) => handleInputChange('country', value)}
              >
                <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && <p className="text-sm text-destructive mt-1">{errors.country}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('booking.step4.guestInfo.arrivalTime')}</label>
              <Input
                value={guestInfo.arrivalTime || ''}
                onChange={(e) => handleInputChange('arrivalTime', e.target.value)}
                placeholder="e.g. 3:00 PM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('booking.step4.guestInfo.specialRequests')}</label>
              <Textarea
                value={guestInfo.specialRequests || ''}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                placeholder="Any dietary restrictions, allergies, or special requests..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('booking.step4.guestInfo.celebrating')}</label>
              <Input
                value={guestInfo.celebratingOccasion || ''}
                onChange={(e) => handleInputChange('celebratingOccasion', e.target.value)}
                placeholder="Birthday, anniversary, honeymoon..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          {t('booking.back')}
        </Button>
        <Button onClick={validateAndContinue} className="btn-cta px-8">
          {t('booking.next')}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
