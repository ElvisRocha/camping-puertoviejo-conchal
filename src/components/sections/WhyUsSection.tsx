import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, Bird, Sparkles, Compass } from 'lucide-react';

const features = [
  { key: 'location', icon: MapPin },
  { key: 'wildlife', icon: Bird },
  { key: 'experience', icon: Sparkles },
  { key: 'flexibility', icon: Compass },
];

const WhyUsSection = () => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="section-padding bg-card" ref={ref}>
      <div className="container-wide">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-section-title text-center mb-16"
        >
          {t('whyUs.title')}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-nature p-8 group hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-forest flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-7 w-7 text-cream" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl mb-3 text-forest">
                      {t(`whyUs.${feature.key}.title`)}
                    </h3>
                    <p className="font-body text-foreground/70 leading-relaxed">
                      {t(`whyUs.${feature.key}.text`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
