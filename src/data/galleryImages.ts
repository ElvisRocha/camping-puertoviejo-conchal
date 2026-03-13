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
    alt: 'Pristine turquoise waters of Playa Conchal',
    altKey: 'gallery.alts.beach1',
    category: 'beach',
    captionKey: 'gallery.captions.beach1',
  },
  {
    id: 'beach-2',
    src: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
    alt: 'Shell sand beach at golden hour',
    altKey: 'gallery.alts.beach2',
    category: 'beach',
    captionKey: 'gallery.captions.beach2',
  },
  {
    id: 'beach-3',
    src: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1200&q=80',
    alt: 'Palm trees along the coastline',
    altKey: 'gallery.alts.beach3',
    category: 'beach',
    captionKey: 'gallery.captions.beach3',
  },
  {
    id: 'beach-4',
    src: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&q=80',
    alt: 'Waves crashing on tropical shore',
    altKey: 'gallery.alts.beach4',
    category: 'beach',
    captionKey: 'gallery.captions.beach4',
  },

  // Wildlife photos
  {
    id: 'wildlife-1',
    src: 'https://res.cloudinary.com/dcvipikha/image/upload/f_auto,q_auto/v1773264500/Iguana_vhd4wj.webp',
    alt: 'iguana in the tree',
    altKey: 'gallery.alts.wildlife1',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife1',
  },
  {
    id: 'wildlife-2',
    src: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1200&q=80',
    alt: 'Scarlet macaw in flight',
    altKey: 'gallery.alts.wildlife2',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife2',
  },
  {
    id: 'wildlife-3',
    src: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=1200&q=80',
    alt: 'Keel-billed toucan on branch',
    altKey: 'gallery.alts.wildlife3',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife3',
  },
  {
    id: 'wildlife-4',
    src: 'https://images.unsplash.com/photo-1463852247062-1bbca38f7805?w=1200&q=80',
    alt: 'White-faced capuchin monkey',
    altKey: 'gallery.alts.wildlife4',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife4',
  },

  // Campsite photos
  {
    id: 'campsite-1',
    src: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80',
    alt: 'Tent at sunset near the beach',
    altKey: 'gallery.alts.campsite1',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite1',
  },
  {
    id: 'campsite-2',
    src: 'https://images.unsplash.com/photo-1533873984035-25970ab07461?w=1200&q=80',
    alt: 'Campfire under the stars',
    altKey: 'gallery.alts.campsite2',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite2',
  },
  {
    id: 'campsite-3',
    src: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80',
    alt: 'Jungle trail through the forest',
    altKey: 'gallery.alts.campsite3',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite3',
  },
  {
    id: 'campsite-4',
    src: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1200&q=80',
    alt: 'Morning at the campsite',
    altKey: 'gallery.alts.campsite4',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite4',
  },

  // Sunset photos
  {
    id: 'sunset-1',
    src: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1200&q=80',
    alt: 'Pacific sunset over calm waters',
    altKey: 'gallery.alts.sunset1',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset1',
  },
  {
    id: 'sunset-2',
    src: 'https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?w=1200&q=80',
    alt: 'Golden hour on the beach',
    altKey: 'gallery.alts.sunset2',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset2',
  },
  {
    id: 'sunset-3',
    src: 'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=1200&q=80',
    alt: 'Dramatic twilight sky',
    altKey: 'gallery.alts.sunset3',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset3',
  },
  {
    id: 'sunset-4',
    src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
    alt: 'Silhouettes at sunset',
    altKey: 'gallery.alts.sunset4',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset4',
  },
];
