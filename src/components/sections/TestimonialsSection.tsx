import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { testimonials, type Testimonial } from '@/data/testimonials';

// Constants
const DESKTOP_TRUNCATE = 200;
const MOBILE_TRUNCATE = 150;
const AUTO_ROTATE_MS = 5000;
const SWIPE_THRESHOLD = 50;
const CAROUSEL_TRANSITION_MS = 400;

// Avatar gradient colors
const AVATAR_GRADIENTS = [
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-cyan-400 to-blue-500',
  'from-lime-400 to-green-500',
  'from-fuchsia-400 to-pink-500',
  'from-sky-400 to-blue-500',
  'from-yellow-400 to-amber-500',
  'from-red-400 to-rose-500',
  'from-teal-400 to-emerald-500',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

function getItemsPerView(): number {
  if (typeof window === 'undefined') return 1;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
}

function useIsSpanish() {
  const { i18n } = useTranslation();
  return i18n.language.startsWith('es');
}

function getReviewText(t: Testimonial, isEs: boolean) {
  return isEs ? t.textEs : t.textEn;
}

function getReviewTime(t: Testimonial, isEs: boolean) {
  return isEs ? t.timeEs : t.timeEn;
}

// Star rating
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  );
}

// Avatar with initials
function AvatarInitials({ name, index }: { name: string; index: number }) {
  const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  return (
    <div
      className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}

// Testimonial Card
function TestimonialCard({
  testimonial,
  index,
  onReadMore,
}: {
  testimonial: Testimonial;
  index: number;
  onReadMore: () => void;
}) {
  const { t } = useTranslation();
  const isEs = useIsSpanish();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const text = getReviewText(testimonial, isEs);
  const maxLen = isMobile ? MOBILE_TRUNCATE : DESKTOP_TRUNCATE;
  const isTruncated = text.length > maxLen;
  const displayText = isTruncated ? truncateText(text, maxLen) : text;

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border h-full flex flex-col">
      <Quote className="w-8 h-8 text-primary/20 mb-4" />
      <p className="text-foreground/80 leading-relaxed flex-grow mb-4 italic">
        "{displayText}"
      </p>
      {isTruncated && (
        <button
          onClick={onReadMore}
          className="text-primary text-sm font-medium hover:underline mb-4 self-start"
        >
          {t('testimonials.readMore')}
        </button>
      )}
      <div className="mb-4">
        <StarRating rating={testimonial.rating} />
      </div>
      <div className="flex items-center gap-4 pt-4 border-t">
        <AvatarInitials name={testimonial.name} index={index} />
        <div>
          <p className="font-semibold text-foreground">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">
            {getReviewTime(testimonial, isEs)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Modal
function TestimonialModal({
  testimonialIndex,
  onClose,
  onPrev,
  onNext,
}: {
  testimonialIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const isEs = useIsSpanish();
  const testimonial = testimonials[testimonialIndex];
  const touchStartX = useRef(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        setDirection(-1);
        onPrev();
      }
      if (e.key === 'ArrowRight') {
        setDirection(1);
        onNext();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        setDirection(-1);
        onPrev();
      } else {
        setDirection(1);
        onNext();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-card rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 md:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t('testimonials.close')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Counter */}
        <div className="text-center text-sm text-muted-foreground mb-6">
          {testimonialIndex + 1} / {testimonials.length}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 50 }}
            transition={{ duration: 0.25 }}
          >
            <Quote className="w-10 h-10 text-primary/20 mb-4" />
            <p className="text-foreground/80 leading-relaxed mb-6 italic text-lg">
              "{getReviewText(testimonial, isEs)}"
            </p>
            <div className="mb-4">
              <StarRating rating={testimonial.rating} />
            </div>
            <div className="flex items-center gap-4 pt-4 border-t">
              <AvatarInitials name={testimonial.name} index={testimonialIndex} />
              <div>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">
                  {getReviewTime(testimonial, isEs)}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => {
              setDirection(-1);
              onPrev();
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t('testimonials.prev')}
          >
            <ChevronLeft className="w-4 h-4" />
            {t('testimonials.prev')}
          </button>
          <button
            onClick={() => {
              setDirection(1);
              onNext();
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t('testimonials.next')}
          >
            {t('testimonials.next')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Main section
export default function TestimonialsSection() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const totalItems = testimonials.length;
  const totalPages = Math.ceil(totalItems / itemsPerView);

  // Responsive items per view
  useEffect(() => {
    const update = () => setItemsPerView(getItemsPerView());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Reset page on items per view change
  useEffect(() => {
    setCurrentPage(0);
    setIsTransitioning(true);
  }, [itemsPerView]);

  // Extended items for infinite loop: [clone last page] [real items] [clone first page]
  const extendedItems = [
    ...testimonials.slice(-itemsPerView),
    ...testimonials,
    ...testimonials.slice(0, itemsPerView),
  ];
  const offset = itemsPerView; // clone offset

  const getTranslateX = useCallback(
    (page: number) => {
      const index = page * itemsPerView + offset;
      return -(index * (100 / itemsPerView));
    },
    [itemsPerView, offset]
  );

  // Auto-rotation
  useEffect(() => {
    if (isPaused || modalIndex !== null) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentPage((p) => p + 1);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [isPaused, modalIndex]);

  // Handle infinite loop jump
  const handleTransitionEnd = useCallback(() => {
    if (currentPage >= totalPages) {
      setIsTransitioning(false);
      requestAnimationFrame(() => {
        setCurrentPage(0);
      });
    } else if (currentPage < 0) {
      setIsTransitioning(false);
      requestAnimationFrame(() => {
        setCurrentPage(totalPages - 1);
      });
    }
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    setIsTransitioning(true);
    setCurrentPage(page);
  };

  const goNext = () => {
    setIsTransitioning(true);
    setCurrentPage((p) => p + 1);
  };

  const goPrev = () => {
    setIsTransitioning(true);
    setCurrentPage((p) => p - 1);
  };

  // Touch handling for carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) goPrev();
      else goNext();
    }
  };

  // Modal navigation
  const openModal = (realIndex: number) => setModalIndex(realIndex);
  const closeModal = () => setModalIndex(null);
  const modalPrev = () =>
    setModalIndex((i) => (i !== null ? (i - 1 + totalItems) % totalItems : null));
  const modalNext = () =>
    setModalIndex((i) => (i !== null ? (i + 1) % totalItems : null));

  // Normalize displayed page for dots
  const displayPage =
    currentPage < 0
      ? totalPages - 1
      : currentPage >= totalPages
        ? 0
        : currentPage;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="font-semibold text-foreground">5.0</span>
            <span className="text-muted-foreground">
              {t('testimonials.ratingCount')}
            </span>
          </div>
        </motion.div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Arrows */}
          <button
            onClick={goPrev}
            className="absolute -left-2 md:-left-6 top-1/2 -translate-y-1/2 z-10 bg-card shadow-lg border rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t('testimonials.prev')}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute -right-2 md:-right-6 top-1/2 -translate-y-1/2 z-10 bg-card shadow-lg border rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t('testimonials.next')}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Track */}
          <div className="overflow-hidden mx-6 md:mx-8">
            <div
              ref={trackRef}
              className="flex"
              style={{
                transform: `translateX(${getTranslateX(currentPage)}%)`,
                transition: isTransitioning
                  ? `transform ${CAROUSEL_TRANSITION_MS}ms ease-in-out`
                  : 'none',
              }}
              onTransitionEnd={handleTransitionEnd}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {extendedItems.map((testimonial, i) => {
                // Calculate real index for avatar color
                const realIndex =
                  (i - offset + totalItems) % totalItems;
                return (
                  <div
                    key={`${testimonial.id}-${i}`}
                    className="px-3 shrink-0"
                    style={{ width: `${100 / itemsPerView}%` }}
                  >
                    <TestimonialCard
                      testimonial={testimonial}
                      index={realIndex}
                      onReadMore={() => openModal(realIndex)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === displayPage
                  ? 'bg-primary'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`${t('testimonials.goToSlide')} ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalIndex !== null && (
        <TestimonialModal
          testimonialIndex={modalIndex}
          onClose={closeModal}
          onPrev={modalPrev}
          onNext={modalNext}
        />
      )}
    </section>
  );
}
