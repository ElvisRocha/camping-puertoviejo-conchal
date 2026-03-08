import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
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
import { RescheduleModal } from '@/components/booking/RescheduleModal';
import { CancelBookingModal } from '@/components/booking/CancelBookingModal';
// Logo - local asset
import logoImage from '@/assets/Logo-Camping-Puerto-Viejo.png';

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const reserveMenuRef = useRef<HTMLDivElement>(null);

  // How long the Framer Motion exit animation takes for the mobile menu.
  const MENU_ANIMATION_MS = 350;

  // The fixed header is ~72-80px tall.
  const HEADER_OFFSET = 80;

  // Custom scroll animation — browser's native `behavior:'smooth'` has no
  // speed control. Using requestAnimationFrame + easeInOutCubic lets us set
  // an explicit duration (ms) for a slower, more deliberate feel.
  const smoothScroll = (targetY: number, duration = 900) => {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const top =
      element.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
    smoothScroll(top);
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (location.pathname === '/' && href.startsWith('/#')) {
      e.preventDefault();
      const elementId = href.replace('/#', '');
      // Close the menu BEFORE scrolling. If the mobile menu is open its
      // collapse animation shifts the page layout; firing scrollTo during
      // that animation lands on the wrong position. The delay lets the
      // animation complete first. On desktop the menu is never open so the
      // delay is 0 and the scroll is instantaneous.
      const delay = isMobileMenuOpen ? MENU_ANIMATION_MS : 0;
      setIsMobileMenuOpen(false);
      setTimeout(() => scrollToSection(elementId), delay);
    } else if (location.pathname === '/' && href === '/') {
      e.preventDefault();
      const delay = isMobileMenuOpen ? MENU_ANIMATION_MS : 0;
      setIsMobileMenuOpen(false);
      setTimeout(() => smoothScroll(0), delay);
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

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (reserveMenuRef.current && !reserveMenuRef.current.contains(e.target as Node)) {
        setIsReserveOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
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
    <>
    <RescheduleModal
      open={isRescheduleModalOpen}
      onClose={() => setIsRescheduleModalOpen(false)}
    />
    <CancelBookingModal
      open={isCancelModalOpen}
      onClose={() => setIsCancelModalOpen(false)}
    />
    {/* Skip to main content - accessibility */}
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-forest focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:outline-none"
    >
      Skip to main content
    </a>
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
          <img
            src={logoImage}
            alt="Camping Puerto Viejo Conchal Logo"
            width="56"
            height="56"
            className="h-12 sm:h-14 w-auto object-contain"
          />
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

          {/* Book Now Split Button */}
          <div className="hidden sm:block relative" ref={reserveMenuRef}>
            <div className="flex items-stretch">
              <Link to="/book">
                <Button className="btn-cta rounded-r-none">
                  {t('nav.bookNow')}
                </Button>
              </Link>
              <div className="w-px bg-white/30 self-stretch" />
              <Button
                className="btn-cta rounded-l-none px-2"
                onClick={() => setIsReserveOpen(!isReserveOpen)}
                aria-label="More booking options"
                aria-expanded={isReserveOpen}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            {isReserveOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-border min-w-[180px]">
                <button
                  className="w-full text-left px-4 py-2 font-body font-medium text-sm text-foreground hover:text-accent transition-colors"
                  onClick={() => {
                    setIsReserveOpen(false);
                    setIsRescheduleModalOpen(true);
                  }}
                >
                  {t('nav.reschedule')}
                </button>
                <button
                  className="w-full text-left px-4 py-2 font-body font-medium text-sm text-foreground hover:text-accent transition-colors"
                  onClick={() => setIsReserveOpen(false)}
                >
                  {t('nav.cancel_booking')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
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
    </>
  );
};

export default Header;
