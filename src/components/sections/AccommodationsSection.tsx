import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TENT_OPTIONS } from '@/types/booking';

const AccommodationsSection = () => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="accommodations" className="section-padding bg-card" ref={ref}>
      <div className="container-wide">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-section-title text-center mb-16"
        >
          {t('accommodations.title')}
        </motion.h2>

        {/* Bring Your Own Option */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card-nature p-8 mb-12 bg-gradient-to-r from-sand/50 to-cream/50 border-2 border-sand"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="text-6xl">🎒</div>
            <div className="flex-1">
              <h3 className="font-heading font-bold text-2xl mb-2 text-forest">
                {t('accommodations.bringOwn.title')}
              </h3>
              <p className="font-body text-foreground/70 mb-4">
                {t('accommodations.bringOwn.text')}
              </p>
              <span className="inline-block px-4 py-2 bg-forest text-primary-foreground rounded-full font-heading font-semibold text-sm">
                {t('accommodations.bringOwn.price')}
              </span>
            </div>
            <Link to="/book">
              <Button className="btn-cta">
                {t('nav.bookNow')}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Rental Option Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-10"
        >
          <h3 className="font-heading font-bold text-2xl mb-2 text-forest">
            {t('accommodations.rental.title')}
          </h3>
          <p className="font-body text-foreground/70 max-w-2xl mx-auto">
            {t('accommodations.rental.text')}
          </p>
        </motion.div>

        {/* Tent Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TENT_OPTIONS.map((tent, index) => (
            <motion.div
              key={tent.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="card-nature overflow-hidden group"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={tent.image}
                  alt={t(tent.nameKey)}
                  width="400"
                  height="300"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-heading font-bold text-xl text-forest">
                    {tent.icon} {t(tent.nameKey)}
                  </h4>
                  <span className="text-sm font-body text-muted-foreground">
                    {tent.capacity} guests
                  </span>
                </div>
                <p className="font-body text-foreground/70 text-sm mb-4">
                  {t(tent.descriptionKey)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-xl text-sea-green">
                    ${tent.pricePerNight}
                    <span className="text-sm font-normal text-muted-foreground">/night</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link to="/book">
            <Button className="btn-hero">
              {t('hero.cta')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default AccommodationsSection;
