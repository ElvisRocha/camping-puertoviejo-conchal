import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SITE_CONFIG } from '@/types/booking';
import { languages } from '@/i18n';
// Logo - local asset
import logoImage from '@/assets/Logo-Camping-Puerto-Viejo.png';

const Footer = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const quickLinks = [
    { key: 'bookNow', href: '/book' },
    { key: 'experience', href: '/#experience' },
    { key: 'accommodations', href: '/#accommodations' },
    { key: 'gallery', href: '/gallery' },
    { key: 'contact', href: '/contact' },
  ];

  const legalLinks = [
    { key: 'privacy', href: '/privacy' },
    { key: 'terms', href: '/terms' },
    { key: 'cancellation', href: '/cancellation' },
  ];

  return (
    <footer className="bg-forest text-primary-foreground">
      {/* Main Footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img
                src={logoImage}
                alt="Camping Puerto Viejo Conchal Logo"
                width="56"
                height="56"
                className="h-14 w-auto object-contain"
                loading="lazy"
              />
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl leading-tight text-cream">
                  Camping Puerto Viejo
                </span>
                <span className="text-xs font-medium tracking-wider uppercase text-sage">
                  Conchal
                </span>
              </div>
            </Link>
            <p className="font-body text-cream/80 italic mb-6">
              "{t('footer.tagline')}"
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-3 text-cream/80 hover:text-cream transition-colors font-body text-sm"
              >
                <Mail className="h-4 w-4" />
                {SITE_CONFIG.email}
              </a>
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.replace(/\D/g, '')}`}
                className="flex items-center gap-3 text-cream/80 hover:text-cream transition-colors font-body text-sm"
              >
                <Phone className="h-4 w-4" />
                {SITE_CONFIG.whatsapp}
              </a>
              <div className="flex items-start gap-3 text-cream/80 font-body text-sm">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {SITE_CONFIG.location}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-cream mb-4">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.href}
                    className="font-body text-cream/80 hover:text-cream transition-colors text-sm"
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-heading font-semibold text-cream mb-4">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.href}
                    className="font-body text-cream/80 hover:text-cream transition-colors text-sm"
                  >
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div className="mt-6">
              <div className="flex gap-4">
                <a
                  href={`https://instagram.com/${SITE_CONFIG.social.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-forest-light flex items-center justify-center text-cream hover:bg-sea-green transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href={`https://facebook.com${SITE_CONFIG.social.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-forest-light flex items-center justify-center text-cream hover:bg-sea-green transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading font-semibold text-cream mb-2">
              {t('footer.newsletter.title')}
            </h4>
            <p className="font-body text-cream/80 text-sm mb-4">
              {t('footer.newsletter.text')}
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={t('footer.newsletter.placeholder')}
                className="bg-forest-light border-0 border-none text-cream placeholder:text-cream/50 focus:ring-sea-green focus:ring-1"
              />
              <Button className="bg-sea-green hover:bg-accent text-accent-foreground px-4">
                {t('footer.newsletter.button')}
              </Button>
            </div>

            {/* Language Selector */}
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {languages.slice(0, 4).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`text-sm font-body transition-colors ${
                      i18n.language === lang.code
                        ? 'text-cream font-medium'
                        : 'text-cream/60 hover:text-cream'
                    }`}
                  >
                    {lang.flag} {lang.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div>
        <div className="container-wide py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-sm text-cream/70 text-center sm:text-left">
            {t('footer.copyright')}
          </p>
          <p className="font-body text-sm text-cream/70">
            🌐 {SITE_CONFIG.domain}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
