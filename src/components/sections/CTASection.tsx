import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lock, CreditCard, Calendar, MessageCircle } from 'lucide-react';

const CTASection = () => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const trustBadges = [
    { key: 'secure', icon: Lock },
    { key: 'payment', icon: CreditCard },
    { key: 'cancel', icon: Calendar },
    { key: 'support', icon: MessageCircle },
  ];

  return (
    <section className="relative py-24 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-forest" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=1920')] bg-cover bg-center opacity-20" />
      
      <div className="relative z-10 container-wide text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-heading font-bold text-cream mb-6"
        >
          {t('cta.title')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-body text-lg text-cream/80 max-w-2xl mx-auto mb-4"
        >
          {t('cta.text')}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-body text-xl text-cream font-medium mb-8"
        >
          {t('cta.subtext')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Link to="/book">
            <Button className="bg-sunset hover:bg-sunset-warm text-primary-foreground px-10 py-6 text-lg font-heading font-bold rounded-full shadow-strong hover:scale-105 transition-all duration-300">
              {t('cta.button')}
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 mt-10"
        >
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.key} className="flex items-center gap-2 text-cream/80">
                <Icon className="h-4 w-4" />
                <span className="font-body text-sm">{t(`cta.trust.${badge.key}`)}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
