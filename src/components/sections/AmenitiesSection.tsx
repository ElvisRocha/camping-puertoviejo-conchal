import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  ShowerHead, 
  Toilet, 
  Flame, 
  Car, 
  Wifi, 
  ChefHat, 
  Shield, 
  Map 
} from 'lucide-react';

const amenities = [
  { key: 'showers', icon: ShowerHead },
  { key: 'restrooms', icon: Toilet },
  { key: 'campfire', icon: Flame },
  { key: 'parking', icon: Car },
  { key: 'wifi', icon: Wifi },
  { key: 'cooking', icon: ChefHat },
  { key: 'security', icon: Shield },
  { key: 'tours', icon: Map },
];

const AmenitiesSection = () => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="section-padding bg-muted" ref={ref}>
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-section-title mb-4">{t('amenities.title')}</h2>
          <p className="font-body text-foreground/70 max-w-2xl mx-auto text-lg">
            {t('amenities.intro')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {amenities.map((amenity, index) => {
            const Icon = amenity.icon;
            return (
              <motion.div
                key={amenity.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-card rounded-2xl p-6 text-center shadow-soft hover:shadow-medium transition-all duration-300 group"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sea-green to-forest flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-7 w-7 text-cream" />
                </div>
                <h4 className="font-heading font-semibold text-forest mb-2">
                  {t(`amenities.${amenity.key}.title`)}
                </h4>
                <p className="font-body text-sm text-foreground/60">
                  {t(`amenities.${amenity.key}.text`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AmenitiesSection;
