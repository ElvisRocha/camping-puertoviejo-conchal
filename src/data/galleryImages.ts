export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: 'beach' | 'wildlife' | 'campsite' | 'sunsets';
  captionKey: string;
}

export const galleryImages: GalleryImage[] = [
  // Beach photos
  {
    id: 'beach-1',
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    alt: 'Pristine turquoise waters of Playa Conchal',
    category: 'beach',
    captionKey: 'gallery.captions.beach1',
  },
  {
    id: 'beach-2',
    src: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
    alt: 'Shell sand beach at golden hour',
    category: 'beach',
    captionKey: 'gallery.captions.beach2',
  },
  {
    id: 'beach-3',
    src: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1200&q=80',
    alt: 'Palm trees along the coastline',
    category: 'beach',
    captionKey: 'gallery.captions.beach3',
  },
  {
    id: 'beach-4',
    src: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&q=80',
    alt: 'Waves crashing on tropical shore',
    category: 'beach',
    captionKey: 'gallery.captions.beach4',
  },
  
  // Wildlife photos
  {
    id: 'wildlife-1',
    src: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=1200&q=80',
    alt: 'Howler monkey in the canopy',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife1',
  },
  {
    id: 'wildlife-2',
    src: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1200&q=80',
    alt: 'Scarlet macaw in flight',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife2',
  },
  {
    id: 'wildlife-3',
    src: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=1200&q=80',
    alt: 'Keel-billed toucan on branch',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife3',
  },
  {
    id: 'wildlife-4',
    src: 'https://images.unsplash.com/photo-1463852247062-1bbca38f7805?w=1200&q=80',
    alt: 'White-faced capuchin monkey',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife4',
  },
  
  // Campsite photos
  {
    id: 'campsite-1',
    src: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80',
    alt: 'Tent at sunset near the beach',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite1',
  },
  {
    id: 'campsite-2',
    src: 'https://images.unsplash.com/photo-1533873984035-25970ab07461?w=1200&q=80',
    alt: 'Campfire under the stars',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite2',
  },
  {
    id: 'campsite-3',
    src: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80',
    alt: 'Jungle trail through the forest',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite3',
  },
  {
    id: 'campsite-4',
    src: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1200&q=80',
    alt: 'Morning at the campsite',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite4',
  },
  
  // Sunset photos
  {
    id: 'sunset-1',
    src: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1200&q=80',
    alt: 'Pacific sunset over calm waters',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset1',
  },
  {
    id: 'sunset-2',
    src: 'https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?w=1200&q=80',
    alt: 'Golden hour on the beach',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset2',
  },
  {
    id: 'sunset-3',
    src: 'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=1200&q=80',
    alt: 'Dramatic twilight sky',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset3',
  },
  {
    id: 'sunset-4',
    src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
    alt: 'Silhouettes at sunset',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset4',
  },
];
