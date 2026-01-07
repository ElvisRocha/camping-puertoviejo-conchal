import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Palmtree, Bird, Sun } from 'lucide-react';
import heroImage from '@/assets/hero-beach-sunset.jpg';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-wide text-center py-32 pt-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-hero text-cream mb-6 max-w-5xl mx-auto text-balance">
            {t('hero.headline')}
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-body text-xl text-cream/90 max-w-3xl mx-auto mb-8"
        >
          {t('hero.subheadline')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link to="/book">
            <Button className="btn-hero text-lg px-10 py-6">
              {t('hero.cta')}
            </Button>
          </Link>
        </motion.div>

        {/* Feature Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 sm:gap-8"
        >
          <div className="flex items-center gap-2 text-cream/90">
            <Palmtree className="h-5 w-5" />
            <span className="font-body text-sm sm:text-base">{t('hero.features.beachfront')}</span>
          </div>
          <div className="flex items-center gap-2 text-cream/90">
            <Bird className="h-5 w-5" />
            <span className="font-body text-sm sm:text-base">{t('hero.features.wildlife')}</span>
          </div>
          <div className="flex items-center gap-2 text-cream/90">
            <Sun className="h-5 w-5" />
            <span className="font-body text-sm sm:text-base">{t('hero.features.sunsets')}</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-cream/50 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ height: ['20%', '60%', '20%'] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1 bg-cream/70 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
