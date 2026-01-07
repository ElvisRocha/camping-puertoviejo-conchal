import '@/i18n';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BookingProgress } from '@/components/booking/BookingProgress';
import { Step1Dates } from '@/components/booking/Step1Dates';
import { Step2Guests } from '@/components/booking/Step2Guests';
import { Step3Addons } from '@/components/booking/Step3Addons';
import { Step4Summary } from '@/components/booking/Step4Summary';
import { Step5Payment } from '@/components/booking/Step5Payment';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { useBookingStore } from '@/store/bookingStore';
import { AnimatePresence } from 'framer-motion';

const BookPage = () => {
  const { currentStep } = useBookingStore();
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  const handleBookingComplete = (code: string) => {
    setReferenceCode(code);
  };

  const renderStep = () => {
    if (referenceCode) {
      return <BookingConfirmation referenceCode={referenceCode} />;
    }

    switch (currentStep) {
      case 1:
        return <Step1Dates />;
      case 2:
        return <Step2Guests />;
      case 3:
        return <Step3Addons />;
      case 4:
        return <Step4Summary />;
      case 5:
        return <Step5Payment onComplete={handleBookingComplete} />;
      default:
        return <Step1Dates />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container-wide">
          {!referenceCode && (
            <BookingProgress currentStep={currentStep} totalSteps={5} />
          )}
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookPage;
