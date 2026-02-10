import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/bookingStore';
import { TENT_OPTIONS, PRICING } from '@/types/booking';
import { ArrowLeft, ArrowRight, Minus, Plus, Users, Tent, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Step2Guests() {
  const { t } = useTranslation();
  const { booking, setGuests, setBringOwnTent, addTent, removeTent, prevStep, nextStep } = useBookingStore();

  const guests = booking.guests || { adults: 2, children: 0, infants: 0 };
  const totalGuests = guests.adults + guests.children;

  const updateGuests = (type: 'adults' | 'children' | 'infants', delta: number) => {
    const newValue = Math.max(type === 'adults' ? 1 : 0, (guests[type] || 0) + delta);
    setGuests({ ...guests, [type]: newValue });
  };

  const getTentQuantity = (tentId: string) => {
    return booking.accommodation?.rentedTents?.find(t => t.tentId === tentId)?.quantity || 0;
  };

  const canContinue = totalGuests > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-section-title mb-2">{t('booking.step2.title')}</h2>
        <p className="text-muted-foreground">{t('booking.step2.subtitle')}</p>
      </div>

      {/* Guest Counter */}
      <div className="card-nature p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-forest" />
          <h3 className="font-heading font-bold text-xl">{t('booking.step4.guests')}</h3>
        </div>

        {[
          { type: 'adults' as const, label: t('booking.step2.adults'), min: 1 },
          { type: 'children' as const, label: t('booking.step2.children'), min: 0 },
          { type: 'infants' as const, label: t('booking.step2.infants'), min: 0, note: t('booking.step2.infantsFree') },
        ].map(({ type, label, min, note }) => (
          <div key={type} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
            <div>
              <span className="font-medium">{label}</span>
              {note && <span className="ml-2 text-sm text-forest">({note})</span>}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateGuests(type, -1)}
                disabled={guests[type] <= min}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-semibold">{guests[type]}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateGuests(type, 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="pt-4 text-center">
          <p className="text-muted-foreground">
            {t('booking.step2.campsiteRate')}: <span className="font-semibold text-forest">${PRICING.campsitePerPersonPerNight}/{t('booking.priceTypes.personNight')}</span>
          </p>
        </div>
      </div>

      {/* Tent Selection */}
      <div className="card-nature p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Tent className="w-6 h-6 text-forest" />
          <h3 className="font-heading font-bold text-xl">{t('booking.step2.needTent')}</h3>
        </div>

        {/* Bring Own Tent Option */}
        <button
          onClick={() => setBringOwnTent(true)}
          className={cn(
            'w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4',
            booking.accommodation?.bringOwnTent
              ? 'border-forest bg-forest/10'
              : 'border-border hover:border-forest/50'
          )}
        >
          <div className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center',
            booking.accommodation?.bringOwnTent ? 'border-forest bg-forest' : 'border-muted-foreground'
          )}>
            {booking.accommodation?.bringOwnTent && <Check className="w-4 h-4 text-white" />}
          </div>
          <div>
            <p className="font-semibold">{t('booking.step2.bringOwn')}</p>
            <p className="text-sm text-muted-foreground">{t('booking.step2.bringOwnNote')}</p>
          </div>
        </button>

        {/* Tent Rental Options */}
        <div className="grid gap-4">
          {TENT_OPTIONS.map((tent) => {
            const quantity = getTentQuantity(tent.id);
            return (
              <div
                key={tent.id}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all',
                  quantity > 0 ? 'border-forest bg-forest/5' : 'border-border'
                )}
              >
                  <div className="flex gap-4">
                  <img
                    src={tent.image}
                    alt={t(tent.nameKey)}
                    width="96"
                    height="96"
                    loading="lazy"
                    decoding="async"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{tent.icon} {t(tent.nameKey)}</h4>
                        <p className="text-sm text-muted-foreground">{t('booking.step2.sleeps')} {tent.capacity}</p>
                      </div>
                      <p className="font-bold text-forest">${tent.pricePerNight}/{t('booking.priceTypes.night')}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{t(tent.descriptionKey)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => removeTent(tent.id)}
                        disabled={quantity === 0}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => addTent(tent.id)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          {t('booking.back')}
        </Button>
        <Button onClick={nextStep} disabled={!canContinue} className="btn-cta px-8">
          {t('booking.next')}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
