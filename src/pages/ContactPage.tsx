import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactInfo } from '@/components/contact/ContactInfo';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

// Lazy load the heavy ContactMap component (includes mapbox-gl ~1.5MB)
const ContactMap = lazy(() => import('@/components/contact/ContactMap').then(m => ({ default: m.ContactMap })));

// Loading placeholder for the map
const MapLoadingPlaceholder = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full h-full bg-muted rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground">{t('contact.map.loading', 'Cargando mapa...')}</p>
      </div>
    </div>
  );
};

export default function ContactPage() {
  const { t } = useTranslation();
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  // Lazy-load map when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (mapSectionRef.current) {
      observer.observe(mapSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Fetch the Mapbox token from an edge function
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (err) {
        console.error('Failed to fetch Mapbox token');
      }
    };
    fetchToken();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
          >
            {t('contact.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            {t('contact.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Left Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border h-full flex flex-col">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {t('contact.form.title')}
                </h2>
                <div className="flex-1">
                  <ContactForm />
                </div>
              </div>
            </motion.div>

            {/* Right Column - Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border h-full flex flex-col">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {t('contact.info.title')}
                </h2>
                <div className="flex-1">
                  <ContactInfo />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Map - Full width (lazy-loaded) */}
          <motion.div
            ref={mapSectionRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <div className="bg-card rounded-2xl p-4 shadow-lg border h-[800px]">
              {shouldLoadMap && mapboxToken ? (
                <Suspense fallback={<MapLoadingPlaceholder />}>
                  <ContactMap accessToken={mapboxToken} />
                </Suspense>
              ) : (
                <MapLoadingPlaceholder />
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('contact.faqPrompt')}
            </h3>
            <Link to="/#faq">
              <Button className="shadow-lg gap-2">
                {t('contact.faqLink')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
