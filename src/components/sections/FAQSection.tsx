import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqItems = ['safety', 'packing', 'weather', 'wildlifeSightings', 'families', 'rain', 'booking'];

const FAQSection = () => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="section-padding bg-card" ref={ref}>
      <div className="container-narrow">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-section-title text-center mb-12"
        >
          {t('faq.title')}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item) => (
              <AccordionItem
                key={item}
                value={item}
                className="bg-muted rounded-xl px-6 border-none"
              >
                <AccordionTrigger className="font-heading font-semibold text-left text-forest hover:no-underline py-5">
                  {t(`faq.${item}.q`)}
                </AccordionTrigger>
                <AccordionContent className="font-body text-foreground/70 pb-5">
                  {t(`faq.${item}.a`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
