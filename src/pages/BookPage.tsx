// i18n is initialized in main.tsx before React mounts — no need to re-import here.
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BookingProgress } from '@/components/booking/BookingProgress';
import { Step1Dates } from '@/components/booking/Step1Dates';
import { Step2Guests } from '@/components/booking/Step2Guests';
// PASO 3 — Comentado temporalmente. No eliminar.
/* import { Step3Addons } from '@/components/booking/Step3Addons'; */
import { Step4Summary } from '@/components/booking/Step4Summary';
import { Step5Payment } from '@/components/booking/Step5Payment';
import { RescheduleConfirm } from '@/components/booking/RescheduleConfirm';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { useBookingStore } from '@/store/bookingStore';
import { AnimatePresence } from 'framer-motion';

const BookPage = () => {
  const { currentStep, resetBooking, isRescheduling } = useBookingStore();
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  useEffect(() => {
    // Don't reset booking if we came from the reschedule modal (data is pre-loaded)
    if (!useBookingStore.getState().isRescheduling) {
      resetBooking();
    }
    return () => {
      resetBooking();
    };
  }, [resetBooking]);

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
      // PASO 3 — Comentado temporalmente. No eliminar.
      /* case 3:
        return <Step3Addons />; */
      case 3:
        return <Step4Summary />;
      case 4:
        // Skip payment step entirely when rescheduling
        return isRescheduling
          ? <RescheduleConfirm onComplete={handleBookingComplete} />
          : <Step5Payment onComplete={handleBookingComplete} />;
      default:
        return <Step1Dates />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            {!referenceCode && (
              <BookingProgress currentStep={currentStep} totalSteps={4} />
            )}
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookPage;
