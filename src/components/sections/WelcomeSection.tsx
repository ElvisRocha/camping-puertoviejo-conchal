import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const WelcomeSection = () => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="section-padding bg-gradient-sand" ref={ref}>
      <div className="container-narrow text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-section-title mb-8 text-forest"
        >
          {t('welcome.title')}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6 text-lg text-foreground/80 font-body leading-relaxed"
        >
          <p>{t('welcome.paragraph1')}</p>
          <p>{t('welcome.paragraph2')}</p>
          <p className="text-xl font-medium text-forest italic">
            {t('welcome.paragraph3')}
          </p>
        </motion.div>

        {/* Decorative element */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 h-1 w-24 mx-auto bg-gradient-to-r from-forest via-sea-green to-forest rounded-full"
        />
      </div>
    </section>
  );
};

export default WelcomeSection;
