import '@/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/sections/HeroSection';
import WelcomeSection from '@/components/sections/WelcomeSection';
import WhyUsSection from '@/components/sections/WhyUsSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import AccommodationsSection from '@/components/sections/AccommodationsSection';
import AmenitiesSection from '@/components/sections/AmenitiesSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import CTASection from '@/components/sections/CTASection';
import FAQSection from '@/components/sections/FAQSection';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <WelcomeSection />
        <WhyUsSection />
        <ExperienceSection />
        <AccommodationsSection />
        <AmenitiesSection />
        <TestimonialsSection />
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
