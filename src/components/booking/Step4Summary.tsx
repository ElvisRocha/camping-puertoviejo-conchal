import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useBookingStore } from '@/store/bookingStore';
import { TENT_OPTIONS, ADD_ONS, COUNTRIES } from '@/types/booking';
import { ArrowLeft, ArrowRight, Calendar, Users, Tent, Sparkles, Check, ChevronsUpDown } from 'lucide-react';
import { ContinueFromSummaryButton } from './buttons/ContinueFromSummaryButton';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useState } from 'react';
import { formatLocalizedDate } from '@/lib/dateLocale';
import { formatDualPrice } from '@/lib/priceFormat';
import { cn } from '@/lib/utils';

export function Step4Summary() {
  const { t, i18n } = useTranslation();

  const guestInfoSchema = z.object({
    firstName: z.string().min(2, t('booking.step4.guestInfo.errors.firstNameRequired')).max(50),
    lastName: z.string().min(2, t('booking.step4.guestInfo.errors.lastNameRequired')).max(50),
    email: z.string().email(t('booking.step4.guestInfo.errors.invalidEmail')).max(255),
    phone: z.string().min(5, t('booking.step4.guestInfo.errors.phoneRequired')).max(30),
    country: z.string().min(1, t('booking.step4.guestInfo.errors.countryRequired')),
  });
  const { booking, calculatePricing, setGuestInfo, prevStep, nextStep } = useBookingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countryOpen, setCountryOpen] = useState(false);

  const pricing = calculatePricing();
  const guests = booking.guests || { adults: 0, children: 0, infants: 0 };
  const guestInfo = booking.guestInfo || {
    firstName: '',
    lastName: '',
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
      firstName: guestInfo.firstName,
      lastName: guestInfo.lastName,
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
        {/* Guest Information — LEFT column */}
        <div className="card-nature p-6">
          <h3 className="font-heading font-bold text-xl mb-4">{t('booking.step4.guestInfo.title')}</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('booking.step4.guestInfo.firstName')} *</label>
                <Input
                  value={guestInfo.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder={t('booking.step4.guestInfo.firstNamePlaceholder')}
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('booking.step4.guestInfo.lastName')} *</label>
                <Input
                  value={guestInfo.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder={t('booking.step4.guestInfo.lastNamePlaceholder')}
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('booking.step4.guestInfo.email')} *</label>
              <Input
                type="email"
                value={guestInfo.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t('booking.step4.guestInfo.emailPlaceholder')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('booking.step4.guestInfo.phone')} *</label>
              <div className={cn(
                'flex items-center h-10 w-full rounded-md border bg-background text-sm ring-offset-background',
                errors.phone ? 'border-destructive' : 'border-input',
                'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
              )}>
                <span className="flex items-center px-3 text-muted-foreground border-r border-input h-full select-none whitespace-nowrap">
                  +506
                </span>
                <input
                  type="tel"
                  value={guestInfo.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={t('booking.step4.guestInfo.phonePlaceholder')}
                  className="flex-1 h-full px-3 bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('booking.step4.guestInfo.country')} *</label>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className={cn(
                      'w-full h-10 justify-between font-normal',
                      !guestInfo.country && 'text-muted-foreground',
                      errors.country && 'border-destructive'
                    )}
                  >
                    {guestInfo.country || t('booking.step4.guestInfo.countryPlaceholder')}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder={t('booking.step4.guestInfo.countrySearch')} />
                    <CommandList>
                      <CommandEmpty>{t('booking.step4.guestInfo.noCountryFound')}</CommandEmpty>
                      <CommandGroup>
                        {COUNTRIES.map(country => (
                          <CommandItem
                            key={country}
                            value={country}
                            onSelect={() => {
                              handleInputChange('country', country);
                              setCountryOpen(false);
                            }}
                          >
                            <Check className={cn(
                              'mr-2 h-4 w-4',
                              guestInfo.country === country ? 'opacity-100' : 'opacity-0'
                            )} />
                            {country}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.country && <p className="text-sm text-destructive mt-1">{errors.country}</p>}
            </div>

          </div>
        </div>

        {/* Booking Summary — RIGHT column */}
        <div className="card-nature p-6 space-y-4">
          <h3 className="font-heading font-bold text-xl mb-4">{t('booking.step4.summary')}</h3>

          {/* Dates */}
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <Calendar className="w-5 h-5 text-forest" />
            <div>
              <p className="font-medium">{t('booking.step4.dates')}</p>
              <p className="text-sm text-muted-foreground">
                {booking.checkIn && formatLocalizedDate(booking.checkIn, 'PP', i18n.language)} → {booking.checkOut && formatLocalizedDate(booking.checkOut, 'PP', i18n.language)}
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
              <span>{formatDualPrice(pricing.campsiteFee, t('price_range_connector'))}</span>
            </div>
            {pricing.tentRental > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t('booking.step4.tentRental')}</span>
                <span>{formatDualPrice(pricing.tentRental, t('price_range_connector'))}</span>
              </div>
            )}
            {pricing.addOns > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t('booking.step4.addons')}</span>
                <span>{formatDualPrice(pricing.addOns, t('price_range_connector'))}</span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-2 border-t border-border/50">
              <span>{t('booking.step4.subtotal')}</span>
              <span>{formatDualPrice(pricing.subtotal, t('price_range_connector'))}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span>{t('booking.step4.total')}</span>
              <span className="text-forest">{formatDualPrice(pricing.total, t('price_range_connector'))}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          {t('booking.back')}
        </Button>
        <ContinueFromSummaryButton onClick={validateAndContinue} />
      </div>
    </motion.div>
  );
}
