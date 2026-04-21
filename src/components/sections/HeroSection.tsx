import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Palmtree, Bird, Sun, PawPrint, ShowerHead, Toilet, Flame, Car, Wifi, Shield } from 'lucide-react';

declare const fbq: (...args: unknown[]) => void;

// Cloudinary base path - version comes before folder per Cloudinary URL spec
const CLD = 'https://res.cloudinary.com/dcvipikha/image/upload';

// Generate responsive Cloudinary URL: /transformations/vVersion/folder/file
const cldUrl = (version: string, file: string, w: number) =>
  `${CLD}/f_webp,q_auto:eco,w_${w},c_limit,fl_progressive/${version}/${file}`;

const heroImages = [
  {
    version: 'v1770786784',
    file: 'hero-playa-guanacaste-desktop_yobpml.jpg',
    alt: 'Playa Guanacaste - Vista panorámica de la costa',
  },
  {
    version: 'v1770786784',
    file: 'hero-playa-bahia-desktop_ffdsvi.jpg',
    alt: 'Bahía de Puerto Viejo - Aguas cristalinas',
  },
  {
    version: 'v1770786783',
    file: 'hero-camping-sunset-desktop_qki0cz.jpg',
    alt: 'Camping al atardecer frente al mar',
  },
];

const heroFeatures = [
  { Icon: Palmtree, key: 'hero.features.beachfront' },
  { Icon: Bird, key: 'hero.features.wildlife' },
  { Icon: Sun, key: 'hero.features.sunsets' },
  { Icon: PawPrint, key: 'hero.features.petFriendly' },
  { Icon: ShowerHead, key: 'amenities.showers.title' },
  { Icon: Toilet, key: 'amenities.restrooms.title' },
  { Icon: Flame, key: 'amenities.campfire.title' },
  { Icon: Car, key: 'amenities.parking.title' },
  { Icon: Wifi, key: 'amenities.wifi.title' },
  { Icon: Shield, key: 'amenities.security.title' },
] as const;

const HeroSection = () => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % heroFeatures.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images - Crossfade with Cloudinary-optimized images */}
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
          <img
            src={cldUrl(image.version, image.file, 1920)}
            srcSet={`${cldUrl(image.version, image.file, 800)} 800w, ${cldUrl(image.version, image.file, 1200)} 1200w, ${cldUrl(image.version, image.file, 1920)} 1920w`}
            sizes="100vw"
            alt={image.alt}
            width="1920"
            height="1080"
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={index === 0 ? 'high' : 'low'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>
      ))}
      {/* Overlay siempre visible */}
      <div className="absolute inset-0 bg-forest/40" />

      {/* Content */}
      <div className="relative z-10 container-wide text-center py-32 pt-40">
        <div className="inline-block px-4 py-8 sm:px-12 sm:py-14 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-white mb-6 max-w-5xl mx-auto text-balance drop-shadow-lg leading-tight">
              {t('hero.headline')}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-body text-base sm:text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-8 font-medium drop-shadow-md"
          >
            {t('hero.subheadline')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          >
            <Link to="/book" className="w-full sm:w-auto" onClick={() => fbq('track', 'InitiateCheckout')}>
              <Button className="btn-hero w-full sm:w-auto text-base sm:text-xl px-6 sm:px-12 py-4 sm:py-7">
                {t('hero.cta')}
              </Button>
            </Link>
          </motion.div>

          {/* Feature Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex justify-center items-center h-7 overflow-hidden">
              <AnimatePresence mode="wait">
                {(() => {
                  const { Icon, key } = heroFeatures[currentFeatureIndex];
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: 25 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -25 }}
                      transition={{ duration: 0.7, ease: 'easeInOut' }}
                      className="flex items-center gap-2 text-white/90"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-body text-sm sm:text-base">{t(key)}</span>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
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
