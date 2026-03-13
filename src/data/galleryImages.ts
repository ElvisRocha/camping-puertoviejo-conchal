export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  altKey: string;
  category: 'beach' | 'wildlife' | 'campsite' | 'sunsets';
  captionKey: string;
}

export const galleryImages: GalleryImage[] = [
  // Beach photos
  {
    id: 'beach-1',
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    alt: 'Aguas turquesas prístinas de Playa Conchal',
    altKey: 'Aguas turquesas prístinas de Playa Conchal',
    category: 'beach',
    captionKey: 'gallery.captions.beach-1',
  },
  {
    id: 'beach-2',
    src: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
    alt: 'Playa de arena de conchas al atardecer',
    altKey: 'Playa de arena de conchas al atardecer',
    category: 'beach',
    captionKey: 'gallery.captions.beach-2',
  },
  {
    id: 'beach-3',
    src: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1200&q=80',
    alt: 'Palmeras a lo largo de la costa',
    altKey: 'Palmeras a lo largo de la costa',
    category: 'beach',
    captionKey: 'gallery.captions.beach-3',
  },
  {
    id: 'beach-4',
    src: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&q=80',
    alt: 'Olas rompiendo en la costa tropical',
    altKey: 'Olas rompiendo en la costa tropical',
    category: 'beach',
    captionKey: 'gallery.captions.beach-4',
  },

  // Wildlife photos
  {
    id: 'wildlife-1',
    src: 'https://res.cloudinary.com/dcvipikha/image/upload/f_auto,q_auto/v1773264500/Iguana_vhd4wj.webp',
    alt: 'Iguana en el árbol',
    altKey: 'Iguana en el árbol',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife-1',
  },
  {
    id: 'wildlife-2',
    src: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1200&q=80',
    alt: 'Guacamayo escarlata en vuelo',
    altKey: 'Guacamayo escarlata en vuelo',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife-2',
  },
  {
    id: 'wildlife-3',
    src: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=1200&q=80',
    alt: 'Tucán pico iris en rama',
    altKey: 'Tucán pico iris en rama',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife-3',
  },
  {
    id: 'wildlife-4',
    src: 'https://images.unsplash.com/photo-1463852247062-1bbca38f7805?w=1200&q=80',
    alt: 'Mono capuchino carablanca',
    altKey: 'Mono capuchino carablanca',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife-4',
  },

  // Campsite photos
  {
    id: 'campsite-1',
    src: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80',
    alt: 'Tienda al atardecer cerca de la playa',
    altKey: 'Tienda al atardecer cerca de la playa',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite-1',
  },
  {
    id: 'campsite-2',
    src: 'https://images.unsplash.com/photo-1533873984035-25970ab07461?w=1200&q=80',
    alt: 'Fogata bajo las estrellas',
    altKey: 'Fogata bajo las estrellas',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite-2',
  },
  {
    id: 'campsite-3',
    src: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80',
    alt: 'Sendero de jungla entre el bosque',
    altKey: 'Sendero de jungla entre el bosque',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite-3',
  },
  {
    id: 'campsite-4',
    src: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1200&q=80',
    alt: 'Mañana en el campamento',
    altKey: 'Mañana en el campamento',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite-4',
  },

  // Sunset photos
  {
    id: 'sunset-1',
    src: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1200&q=80',
    alt: 'Atardecer pacífico sobre aguas tranquilas',
    altKey: 'Atardecer pacífico sobre aguas tranquilas',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset-1',
  },
  {
    id: 'sunset-2',
    src: 'https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?w=1200&q=80',
    alt: 'Hora dorada en la playa',
    altKey: 'Hora dorada en la playa',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset-2',
  },
  {
    id: 'sunset-3',
    src: 'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=1200&q=80',
    alt: 'Cielo crepuscular dramático',
    altKey: 'Cielo crepuscular dramático',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset-3',
  },
  {
    id: 'sunset-4',
    src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
    alt: 'Siluetas al atardecer',
    altKey: 'Siluetas al atardecer',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset-4',
  },
];
