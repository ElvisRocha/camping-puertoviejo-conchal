import { useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
// i18n is initialized in main.tsx before React mounts — no need to re-import here.
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
    if (!location.hash) return;
    // This fires when navigating from another page (e.g. /gallery → /#experience).
    // A minimal delay lets the page finish painting before we calculate positions.
    const HEADER_OFFSET = 80;
    const timer = setTimeout(() => {
      const element = document.querySelector(location.hash);
      if (!element) return;
      const targetY =
        element.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
      const startY = window.pageYOffset;
      const distance = targetY - startY;
      const startTime = performance.now();
      const duration = 200;
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const step = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        window.scrollTo(0, startY + distance * easeOutCubic(progress));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.hash]);

  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <HeroSection />
        <Suspense fallback={null}>
          <WelcomeSection />
          <WhyUsSection />
          <ExperienceSection />
          <AccommodationsSection />
          <AmenitiesSection />
          <TestimonialsSection />
          <CTASection />
          <FAQSection />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
