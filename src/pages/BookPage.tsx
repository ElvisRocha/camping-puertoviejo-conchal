import '@/i18n';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const BookPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h1 className="text-section-title mb-4">{t('booking.step1.title')}</h1>
            <p className="font-body text-muted-foreground text-lg">{t('booking.step1.subtitle')}</p>
          </div>
          
          <div className="card-nature p-8 text-center">
            <p className="text-6xl mb-6">🏕️</p>
            <h2 className="font-heading font-bold text-2xl text-forest mb-4">
              Booking System Coming Soon
            </h2>
            <p className="font-body text-foreground/70 mb-6 max-w-md mx-auto">
              Our full 5-step booking system with date selection, tent rentals, add-ons, and secure payment is ready to be connected to a backend.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button variant="outline" className="px-8">
                  ← Back to Home
                </Button>
              </Link>
              <a href="mailto:hello@camping-puertoviejo-conchal.com">
                <Button className="btn-cta">
                  Contact Us to Book
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookPage;
