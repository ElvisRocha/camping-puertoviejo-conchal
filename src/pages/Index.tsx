import { useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import '@/i18n';
import Header from '@/components/Header';
import HeroSection from '@/components/sections/HeroSection';

// Lazy load below-the-fold sections and footer for faster initial paint
const WelcomeSection = lazy(() => import('@/components/sections/WelcomeSection'));
const WhyUsSection = lazy(() => import('@/components/sections/WhyUsSection'));
const ExperienceSection = lazy(() => import('@/components/sections/ExperienceSection'));
const AccommodationsSection = lazy(() => import('@/components/sections/AccommodationsSection'));
const AmenitiesSection = lazy(() => import('@/components/sections/AmenitiesSection'));
const TestimonialsSection = lazy(() => import('@/components/sections/TestimonialsSection'));
const CTASection = lazy(() => import('@/components/sections/CTASection'));
const FAQSection = lazy(() => import('@/components/sections/FAQSection'));
const Footer = lazy(() => import('@/components/Footer'));

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <HeroSection />
        {/* <Suspense fallback={null}>
          <WelcomeSection />
          <WhyUsSection />
          <ExperienceSection />
          <AccommodationsSection />
          <AmenitiesSection />
          <TestimonialsSection />
          <CTASection />
          <FAQSection />
        </Suspense> */}
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
