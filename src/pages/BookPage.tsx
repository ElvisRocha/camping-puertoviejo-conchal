import '@/i18n';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BookingProgress } from '@/components/booking/BookingProgress';
import { Step1Dates } from '@/components/booking/Step1Dates';
import { Step2Guests } from '@/components/booking/Step2Guests';
// PASO 3 — Comentado temporalmente. No eliminar.
/* import { Step3Addons } from '@/components/booking/Step3Addons'; */
import { Step4Summary } from '@/components/booking/Step4Summary';
import { Step5Payment } from '@/components/booking/Step5Payment';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { useBookingStore } from '@/store/bookingStore';
import { AnimatePresence } from 'framer-motion';

const BookPage = () => {
  const { currentStep, nextStep, prevStep } = useBookingStore();
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const prevStepRef = useRef(currentStep);

  // PASO 3 — Comentado temporalmente. No eliminar.
  // Cuando el flujo llega al paso 3 se salta automáticamente en la dirección correcta.
  useEffect(() => {
    if (currentStep === 3) {
      if (prevStepRef.current < 3) {
        nextStep(); // venía de paso 2 → avanzar al 4
      } else {
        prevStep(); // venía de paso 4 → retroceder al 2
      }
    }
    prevStepRef.current = currentStep;
  }, [currentStep, nextStep, prevStep]);

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
            // PASO 3 — Comentado temporalmente. totalSteps cambiado de 5 a 4.
            <BookingProgress currentStep={currentStep} totalSteps={4} />
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
