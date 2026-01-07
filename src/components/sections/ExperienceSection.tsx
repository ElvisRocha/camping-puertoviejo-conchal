import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const timelineItems = [
  { key: 'morning', emoji: '🌅', gradient: 'from-sunset to-sunset-warm' },
  { key: 'midMorning', emoji: '🏖️', gradient: 'from-ocean to-ocean-light' },
  { key: 'afternoon', emoji: '🌿', gradient: 'from-forest to-sea-green' },
  { key: 'evening', emoji: '🌅', gradient: 'from-sunset-warm to-sunset' },
  { key: 'night', emoji: '✨', gradient: 'from-charcoal to-charcoal-light' },
];

const ExperienceSection = () => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="experience" className="section-padding bg-muted leaf-pattern" ref={ref}>
      <div className="container-wide">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-section-title text-center mb-16"
        >
          {t('experience.title')}
        </motion.h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-forest via-sea-green to-forest" />

          <div className="space-y-12 lg:space-y-0">
            {timelineItems.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`lg:grid lg:grid-cols-2 lg:gap-12 items-center ${
                  index % 2 === 1 ? 'lg:text-right' : ''
                }`}
              >
                {/* Content */}
                <div
                  className={`card-nature p-8 ${
                    index % 2 === 1 ? 'lg:order-2' : ''
                  }`}
                >
                  <div className={`flex items-center gap-4 mb-4 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                    <span className="text-4xl">{item.emoji}</span>
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-heading font-semibold text-primary-foreground bg-gradient-to-r ${item.gradient}`}>
                        {t(`experience.${item.key}.time`)}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-2xl mb-3 text-forest">
                    {t(`experience.${item.key}.title`)}
                  </h3>
                  <p className="font-body text-foreground/70 leading-relaxed">
                    {t(`experience.${item.key}.text`)}
                  </p>
                </div>

                {/* Timeline dot */}
                <div className={`hidden lg:flex justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="relative">
                    <div className="w-5 h-5 rounded-full bg-sea-green ring-4 ring-background shadow-glow" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
