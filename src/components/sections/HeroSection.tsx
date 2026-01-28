import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Palmtree, Bird, Sun } from 'lucide-react';

// Optimized images - WebP with JPG fallback
// Desktop versions
import heroPlayaDesktopWebp from '@/assets/optimized/hero-playa-guanacaste-desktop.webp';
import heroPlayaDesktopJpg from '@/assets/optimized/hero-playa-guanacaste-desktop.jpg';
import heroPlayaBahiaDesktopWebp from '@/assets/optimized/hero-playa-bahia-desktop.webp';
import heroPlayaBahiaDesktopJpg from '@/assets/optimized/hero-playa-bahia-desktop.jpg';
import heroBeachDesktopWebp from '@/assets/optimized/hero-beach-sunset-desktop.webp';
import heroBeachDesktopJpg from '@/assets/optimized/hero-beach-sunset-desktop.jpg';
import heroCampingDesktopWebp from '@/assets/optimized/hero-camping-sunset-desktop.webp';
import heroCampingDesktopJpg from '@/assets/optimized/hero-camping-sunset-desktop.jpg';

// Tablet versions
import heroPlayaTabletWebp from '@/assets/optimized/hero-playa-guanacaste-tablet.webp';
import heroPlayaTabletJpg from '@/assets/optimized/hero-playa-guanacaste-tablet.jpg';
import heroPlayaBahiaTabletWebp from '@/assets/optimized/hero-playa-bahia-tablet.webp';
import heroPlayaBahiaTabletJpg from '@/assets/optimized/hero-playa-bahia-tablet.jpg';
import heroBeachTabletWebp from '@/assets/optimized/hero-beach-sunset-tablet.webp';
import heroBeachTabletJpg from '@/assets/optimized/hero-beach-sunset-tablet.jpg';
import heroCampingTabletWebp from '@/assets/optimized/hero-camping-sunset-tablet.webp';
import heroCampingTabletJpg from '@/assets/optimized/hero-camping-sunset-tablet.jpg';

// Mobile versions
import heroPlayaMobileWebp from '@/assets/optimized/hero-playa-guanacaste-mobile.webp';
import heroPlayaMobileJpg from '@/assets/optimized/hero-playa-guanacaste-mobile.jpg';
import heroPlayaBahiaMobileWebp from '@/assets/optimized/hero-playa-bahia-mobile.webp';
import heroPlayaBahiaMobileJpg from '@/assets/optimized/hero-playa-bahia-mobile.jpg';
import heroBeachMobileWebp from '@/assets/optimized/hero-beach-sunset-mobile.webp';
import heroBeachMobileJpg from '@/assets/optimized/hero-beach-sunset-mobile.jpg';
import heroCampingMobileWebp from '@/assets/optimized/hero-camping-sunset-mobile.webp';
import heroCampingMobileJpg from '@/assets/optimized/hero-camping-sunset-mobile.jpg';

interface HeroImage {
  desktop: { webp: string; jpg: string };
  tablet: { webp: string; jpg: string };
  mobile: { webp: string; jpg: string };
  alt: string;
}

const heroImages: HeroImage[] = [
  {
    desktop: { webp: heroPlayaDesktopWebp, jpg: heroPlayaDesktopJpg },
    tablet: { webp: heroPlayaTabletWebp, jpg: heroPlayaTabletJpg },
    mobile: { webp: heroPlayaMobileWebp, jpg: heroPlayaMobileJpg },
    alt: 'Playa Guanacaste - Vista panorámica de la costa'
  },
  {
    desktop: { webp: heroPlayaBahiaDesktopWebp, jpg: heroPlayaBahiaDesktopJpg },
    tablet: { webp: heroPlayaBahiaTabletWebp, jpg: heroPlayaBahiaTabletJpg },
    mobile: { webp: heroPlayaBahiaMobileWebp, jpg: heroPlayaBahiaMobileJpg },
    alt: 'Bahía de Puerto Viejo - Aguas cristalinas'
  },
  {
    desktop: { webp: heroBeachDesktopWebp, jpg: heroBeachDesktopJpg },
    tablet: { webp: heroBeachTabletWebp, jpg: heroBeachTabletJpg },
    mobile: { webp: heroBeachMobileWebp, jpg: heroBeachMobileJpg },
    alt: 'Atardecer en la playa de Puerto Viejo'
  },
  {
    desktop: { webp: heroCampingDesktopWebp, jpg: heroCampingDesktopJpg },
    tablet: { webp: heroCampingTabletWebp, jpg: heroCampingTabletJpg },
    mobile: { webp: heroCampingMobileWebp, jpg: heroCampingMobileJpg },
    alt: 'Camping al atardecer frente al mar'
  }
];

const HeroSection = () => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images - Crossfade with optimized responsive images */}
      {heroImages.map((image, index) => (
        <motion.div
          key={index}
          initial={false}
          animate={{
            opacity: index === currentImageIndex ? 1 : 0,
            scale: index === currentImageIndex ? 1 : 1.05
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <picture>
            {/* WebP sources for modern browsers */}
            <source
              type="image/webp"
              media="(max-width: 640px)"
              srcSet={image.mobile.webp}
            />
            <source
              type="image/webp"
              media="(max-width: 1024px)"
              srcSet={image.tablet.webp}
            />
            <source
              type="image/webp"
              srcSet={image.desktop.webp}
            />
            {/* JPG fallback sources */}
            <source
              type="image/jpeg"
              media="(max-width: 640px)"
              srcSet={image.mobile.jpg}
            />
            <source
              type="image/jpeg"
              media="(max-width: 1024px)"
              srcSet={image.tablet.jpg}
            />
            <img
              src={image.desktop.jpg}
              alt={image.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding={index === 0 ? 'sync' : 'async'}
              fetchPriority={index === 0 ? 'high' : 'low'}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </picture>
        </motion.div>
      ))}
      {/* Overlay siempre visible */}
      <div className="absolute inset-0 bg-forest/40" />

      {/* Content */}
      <div className="relative z-10 container-wide text-center py-32 pt-40">
        <div className="inline-block px-6 py-10 sm:px-12 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-white mb-6 max-w-5xl mx-auto text-balance drop-shadow-lg">
              {t('hero.headline')}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-body text-lg sm:text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-8 font-medium drop-shadow-md"
          >
            {t('hero.subheadline')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          >
            <Link to="/book">
              <Button className="btn-hero text-xl px-12 py-7">
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
            <div className="flex items-center gap-2 text-white/90">
              <Palmtree className="h-5 w-5" />
              <span className="font-body text-sm sm:text-base">{t('hero.features.beachfront')}</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Bird className="h-5 w-5" />
              <span className="font-body text-sm sm:text-base">{t('hero.features.wildlife')}</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Sun className="h-5 w-5" />
              <span className="font-body text-sm sm:text-base">{t('hero.features.sunsets')}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? 'bg-cream w-6'
                : 'bg-cream/50 hover:bg-cream/70 w-2'
            }`}
            aria-label={`Ver imagen ${index + 1}`}
          />
        ))}
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
