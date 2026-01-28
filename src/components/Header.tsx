import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { languages } from '@/i18n';
import { SITE_CONFIG } from '@/types/booking';
import { cn } from '@/lib/utils';
// Optimized logo - WebP with PNG fallback
import logoImageWebp from '@/assets/optimized/logo.webp';
import logoImagePng from '@/assets/optimized/logo.png';

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    // If we're on home and the link is a hash link, scroll manually
    if (location.pathname === '/' && href.startsWith('/#')) {
      e.preventDefault();
      const elementId = href.replace('/#', '');
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setIsMobileMenuOpen(false);
    } else if (location.pathname === '/' && href === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  // Check if we're on the home page (hero has transparent header)
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Header should have solid background on non-home pages or when scrolled
  const hasBackground = !isHomePage || isScrolled;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const navItems = [
    { key: 'home', href: '/' },
    { key: 'experience', href: '/#experience' },
    { key: 'accommodations', href: '/#accommodations' },
    { key: 'gallery', href: '/gallery' },
    { key: 'contact', href: '/contact' },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        hasBackground
          ? 'bg-card/95 backdrop-blur-md shadow-soft py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="container-wide flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={(e) => handleNavClick(e, '/')} className="flex items-center gap-3">
          <picture>
              <source type="image/webp" srcSet={logoImageWebp} />
              <img
                src={logoImagePng}
                alt="Camping Puerto Viejo Conchal Logo"
                width="56"
                height="56"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </picture>
          <div className="flex flex-col">
            <span
              className={cn(
                'font-heading font-bold text-base sm:text-lg leading-tight transition-colors',
                hasBackground ? 'text-forest' : 'text-cream'
              )}
            >
              Camping Puerto Viejo
            </span>
            <span
              className={cn(
                'text-xs font-medium tracking-wider uppercase transition-colors',
                hasBackground ? 'text-sage' : 'text-cream/80'
              )}
            >
              Conchal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={cn(
                'font-body font-medium text-sm transition-colors hover:text-accent',
                hasBackground ? 'text-foreground' : 'text-cream'
              )}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'gap-2 font-body',
                  hasBackground
                    ? 'text-foreground hover:bg-muted'
                    : 'text-cream hover:bg-cream/10'
                )}
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={cn(
                    'cursor-pointer font-body',
                    i18n.language === lang.code && 'bg-muted'
                  )}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Book Now Button */}
          <Link to="/book" className="hidden sm:block">
            <Button className="btn-cta">
              {t('nav.bookNow')}
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              'lg:hidden p-2 rounded-lg transition-colors',
              hasBackground ? 'text-foreground' : 'text-cream'
            )}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-t border-border"
          >
            <nav className="container-wide py-6 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="font-body font-medium text-foreground hover:text-accent transition-colors py-2"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
              <Link to="/book" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="btn-cta w-full mt-4">
                  {t('nav.bookNow')}
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
