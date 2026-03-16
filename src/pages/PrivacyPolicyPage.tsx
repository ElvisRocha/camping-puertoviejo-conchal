import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  const sections = [
    'dataController',
    'dataCollected',
    'purpose',
    'dataStorage',
    'thirdParties',
    'cookies',
    'rights',
    'dataRetention',
    'children',
    'changes',
    'contact',
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-6 pb-3 md:pt-8 md:pb-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-4"
          >
            <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-forest" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-3"
          >
            {t('privacyPolicy.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm text-muted-foreground"
          >
            {t('privacyPolicy.lastUpdated')}
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-card rounded-2xl p-6 md:p-10 shadow-lg border"
          >
            {/* Intro */}
            <p className="text-muted-foreground leading-relaxed mb-10 text-base">
              {t('privacyPolicy.intro')}
            </p>

            {/* Sections */}
            <div className="space-y-10">
              {sections.map((section, index) => {
                const listKey = `privacyPolicy.sections.${section}.list`;
                const list = t(listKey, { returnObjects: true });
                const isList = Array.isArray(list);

                return (
                  <motion.div
                    key={section}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + index * 0.04 }}
                  >
                    <h2 className="text-xl font-semibold text-foreground mb-3 font-heading">
                      {t(`privacyPolicy.sections.${section}.title`)}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {t(`privacyPolicy.sections.${section}.content`)}
                    </p>

                    {isList && (
                      <ul className="mt-3 space-y-2 pl-4">
                        {(list as string[]).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-forest flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Rights contact note */}
                    {section === 'rights' && (
                      <p className="mt-3 text-muted-foreground italic">
                        {t('privacyPolicy.sections.rights.contact')}
                      </p>
                    )}

                    {/* Contact section details */}
                    {section === 'contact' && (
                      <div className="mt-3 space-y-1 text-muted-foreground">
                        <p>{t('privacyPolicy.sections.contact.email')}</p>
                        <p>{t('privacyPolicy.sections.contact.address')}</p>
                        <p>{t('privacyPolicy.sections.contact.phone')}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Back link */}
            <div className="mt-12 pt-8 border-t">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-forest hover:text-forest/80 transition-colors font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('privacyPolicy.backHome')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
