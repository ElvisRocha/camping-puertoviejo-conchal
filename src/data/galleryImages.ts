export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  altKey?: string;
  category: 'beach' | 'wildlife' | 'campsite' | 'sunsets';
  captionKey: string;
}

export const galleryImages: GalleryImage[] = [
  // Beach photos
  {
    id: 'beach-1',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773373014/Camping%20Puerto%20Viejo%20Conchal/Gallery/Beach/Playa8.jpg',
    alt: 'Paisajes Majestuosos',
    category: 'beach',
    captionKey: 'gallery.captions.beach1',
  },
  {
    id: 'beach-2',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773373003/Camping%20Puerto%20Viejo%20Conchal/Gallery/Beach/Playa1.jpg',
    alt: 'Aguas cristalinas',
    category: 'beach',
    captionKey: 'gallery.captions.beach2',
  },
  {
    id: 'beach-3',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773373012/Camping%20Puerto%20Viejo%20Conchal/Gallery/Beach/Playa7.jpg',
    alt: 'Playas de conchitas',
    category: 'beach',
    captionKey: 'gallery.captions.beach3',
  },
  {
    id: 'beach-4',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773373009/Camping%20Puerto%20Viejo%20Conchal/Gallery/Beach/Playa5.jpg',
    alt: 'Playas tranquilas',
    category: 'beach',
    captionKey: 'gallery.captions.beach4',
  },
    {
    id: 'beach-5',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773373011/Camping%20Puerto%20Viejo%20Conchal/Gallery/Beach/Playa6.jpg',
    alt: 'Playas de arena blanca',
    category: 'beach',
    captionKey: 'gallery.captions.beach4',
  },
    {
    id: 'beach-6',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773373006/Camping%20Puerto%20Viejo%20Conchal/Gallery/Beach/Playa3.jpg',
    alt: 'Paisajes Memorables',
    category: 'beach',
    captionKey: 'gallery.captions.beach4',
  },
    {
    id: 'beach-7',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773373008/Camping%20Puerto%20Viejo%20Conchal/Gallery/Beach/Playa4.jpg',
    alt: 'Horizontes infinitos',
    category: 'beach',
    captionKey: 'gallery.captions.beach4',
  },
    {
    id: 'beach-8',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773410875/Camping%20Puerto%20Viejo%20Conchal/Gallery/Beach/PlayaM1.jpg',
    alt: 'Playa Minas',
    category: 'beach',
    captionKey: 'gallery.captions.beach4',
  },

  // Wildlife photos
  {
    id: 'wildlife-1',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773373826/Camping%20Puerto%20Viejo%20Conchal/Gallery/Fauna/fauna6.jpg',
    alt: '3 guacamayas en un arbol',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife1',
  },
  {
    id: 'wildlife-2',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773373594/Camping%20Puerto%20Viejo%20Conchal/Gallery/Fauna/fauna5.jpg',
    alt: 'Monos Aulladores',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife2',
  },
  {
    id: 'wildlife-3',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773373591/Camping%20Puerto%20Viejo%20Conchal/Gallery/Fauna/fauna4.jpg',
    alt: 'Iguana en el arbol',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife3',
  },
  {
    id: 'wildlife-4',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773373589/Camping%20Puerto%20Viejo%20Conchal/Gallery/Fauna/fauna3.jpg',
    alt: 'Mono en el arbol',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife4',
  },
  {
    id: 'wildlife-5',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773373589/Camping%20Puerto%20Viejo%20Conchal/Gallery/Fauna/fauna3.jpg',
    alt: 'Mono en el arbol',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife4',
  },{
    id: 'wildlife-6',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773373586/Camping%20Puerto%20Viejo%20Conchal/Gallery/Fauna/fauna2.jpg',
    alt: 'Manada de monos',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife4',
  },{
    id: 'wildlife-7',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773373585/Camping%20Puerto%20Viejo%20Conchal/Gallery/Fauna/fauna1.jpg',
    alt: 'Iguana descansando en el suelo',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife4',
  },{
    id: 'wildlife-8',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773373583/Camping%20Puerto%20Viejo%20Conchal/Gallery/Fauna/fauna7.jpg',
    alt: 'Bandada de guacamayas',
    category: 'wildlife',
    captionKey: 'gallery.captions.wildlife4',
  },

  // Campsite photos
  {
    id: 'campsite-1',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773412473/Camping%20Puerto%20Viejo%20Conchal/Gallery/Camping/Camping.jpg',
    alt: 'trae tu propio camper',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite1',
  },
  {
    id: 'campsite-3',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773372535/Camping%20Puerto%20Viejo%20Conchal/Gallery/Camping/camping8.jpg',
    alt: 'Espacio amplio para camping',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite3',
  },
  {
    id: 'campsite-4',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773372534/Camping%20Puerto%20Viejo%20Conchal/Gallery/Camping/camping6.jpg',
    alt: 'Area de Cocinas y Parrilladas',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite4',
  },
   {
    id: 'campsite-2',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773412604/Camping%20Puerto%20Viejo%20Conchal/Gallery/Camping/camping2.jpg',
    alt: 'trae tu propio camper',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite2',
  },
    {
    id: 'campsite-5',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773372536/Camping%20Puerto%20Viejo%20Conchal/Gallery/Camping/camping10.jpg',
    alt: 'Renta tiendas de campaña',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite4',
  },
    {
    id: 'campsite-6',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773372532/Camping%20Puerto%20Viejo%20Conchal/Gallery/Camping/camping3.jpg',
    alt: 'Flora exuberante',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite4',
  },
    {
    id: 'campsite-7',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773414029/Camping%20Puerto%20Viejo%20Conchal/Gallery/Camping/ba%C3%B1os.jpg',
    alt: 'Duchas Frescas',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite4',
  },
    {
    id: 'campsite-8',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773414518/Camping%20Puerto%20Viejo%20Conchal/Gallery/Camping/servicios.jpg',
    alt: 'Baños',
    category: 'campsite',
    captionKey: 'gallery.captions.campsite4',
  },
   
  
  // Sunset photos
  {
    id: 'sunset-1',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773412677/Camping%20Puerto%20Viejo%20Conchal/Gallery/Sunsets/Atardecer.jpg',
    alt: 'Atardeceres Hermosos',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset1',
  },
  {
    id: 'sunset-2',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773372318/Camping%20Puerto%20Viejo%20Conchal/Gallery/Sunsets/ATARDECER9.jpg',
    alt: 'Vistas increibles',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset2',
  },
  {
    id: 'sunset-3',
    src: 'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=1200&q=80',
    alt: 'Puesta de sol naranja',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset3',
  },
  {
    id: 'sunset-4',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773372318/Camping%20Puerto%20Viejo%20Conchal/Gallery/Sunsets/ATARDECER8.jpg',
    alt: 'El final de gran dia',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset4',
  },
    {
    id: 'sunset-5',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773372317/Camping%20Puerto%20Viejo%20Conchal/Gallery/Sunsets/ATARDECER7.jpg',
    alt: 'Playa de conchas magicas',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset4',
  },
    {
    id: 'sunset-6',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773372316/Camping%20Puerto%20Viejo%20Conchal/Gallery/Sunsets/ATARDECER4.jpg',
    alt: 'Atardecer dorado en la playa',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset4',
  },
    {
    id: 'sunset-7',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773372317/Camping%20Puerto%20Viejo%20Conchal/Gallery/Sunsets/ATARDECER6.jpg',
    alt: 'Vista panorámica del atardecer',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset4',
  },
    {
    id: 'sunset-8',
    src: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773372316/Camping%20Puerto%20Viejo%20Conchal/Gallery/Sunsets/ATARDECER3.jpg',
    alt: 'Atardecer tranquilo sobre el océano Pacífico visto desde la costa tropical',
    category: 'sunsets',
    captionKey: 'gallery.captions.sunset4',
  },
];
