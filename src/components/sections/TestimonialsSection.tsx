import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface Testimonial {
  id: string;
  nameKey: string;
  locationKey: string;
  textKey: string;
  rating: number;
  image: string;
  dateKey: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    nameKey: 'testimonials.reviews.sarah.name',
    locationKey: 'testimonials.reviews.sarah.location',
    textKey: 'testimonials.reviews.sarah.text',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    dateKey: 'testimonials.reviews.sarah.date',
  },
  {
    id: '2',
    nameKey: 'testimonials.reviews.michael.name',
    locationKey: 'testimonials.reviews.michael.location',
    textKey: 'testimonials.reviews.michael.text',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    dateKey: 'testimonials.reviews.michael.date',
  },
  {
    id: '3',
    nameKey: 'testimonials.reviews.emma.name',
    locationKey: 'testimonials.reviews.emma.location',
    textKey: 'testimonials.reviews.emma.text',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    dateKey: 'testimonials.reviews.emma.date',
  },
  {
    id: '4',
    nameKey: 'testimonials.reviews.carlos.name',
    locationKey: 'testimonials.reviews.carlos.location',
    textKey: 'testimonials.reviews.carlos.text',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    dateKey: 'testimonials.reviews.carlos.date',
  },
  {
    id: '5',
    nameKey: 'testimonials.reviews.lisa.name',
    locationKey: 'testimonials.reviews.lisa.location',
    textKey: 'testimonials.reviews.lisa.text',
    rating: 4,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    dateKey: 'testimonials.reviews.lisa.date',
  },
  {
    id: '6',
    nameKey: 'testimonials.reviews.david.name',
    locationKey: 'testimonials.reviews.david.location',
    textKey: 'testimonials.reviews.david.text',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    dateKey: 'testimonials.reviews.david.date',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { t } = useTranslation();

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border h-full flex flex-col">
      {/* Quote icon */}
      <Quote className="w-8 h-8 text-primary/20 mb-4" />

      {/* Review text */}
      <p className="text-foreground/80 leading-relaxed flex-grow mb-6 italic">
        "{t(testimonial.textKey)}"
      </p>

      {/* Rating */}
      <div className="mb-4">
        <StarRating rating={testimonial.rating} />
      </div>

      {/* Author info */}
      <div className="flex items-center gap-4 pt-4 border-t">
        <img
          src={testimonial.image}
          alt={t(testimonial.nameKey)}
          width="48"
          height="48"
          loading="lazy"
          decoding="async"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-foreground">
            {t(testimonial.nameKey)}
          </p>
          <p className="text-sm text-muted-foreground">
            {t(testimonial.locationKey)}
          </p>
        </div>
        <span className="ml-auto text-xs text-muted-foreground">
          {t(testimonial.dateKey)}
        </span>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const { t } = useTranslation();

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
          
          {/* Overall rating */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="font-semibold text-foreground">4.9</span>
            <span className="text-muted-foreground">
              {t('testimonials.ratingCount')}
            </span>
          </div>
        </motion.div>

        {/* Carousel for mobile/tablet */}
        <div className="block lg:hidden">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full"
                  >
                    <TestimonialCard testimonial={testimonial} />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 md:-left-6" />
            <CarouselNext className="-right-4 md:-right-6" />
          </Carousel>
        </div>

        {/* Grid for desktop */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
