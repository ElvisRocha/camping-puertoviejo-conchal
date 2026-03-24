export interface TentOption {
  id: string;
  name: string;
  nameKey: string;
  capacity: number;
  pricePerNight: number;
  description: string;
  descriptionKey: string;
  image: string;
  icon: string;
}

export interface AddOn {
  id: string;
  name: string;
  nameKey: string;
  price: number;
  priceType: 'per-person' | 'per-day' | 'per-night' | 'flat';
  description: string;
  descriptionKey: string;
  image: string;
  icon: string;
}

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  arrivalTime?: string;
  specialRequests?: string;
  celebratingOccasion?: string;
}

export interface TentSelection {
  tentId: string;
  quantity: number;
}

export interface PricingBreakdown {
  campsiteFee: number;
  tentRental: number;
  addOns: number;
  subtotal: number;
  taxes: number;
  total: number;
  nights: number;
}

export interface Booking {
  id: string;
  referenceCode: string;
  checkIn: Date | null;
  checkOut: Date | null;
  nights: number;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  accommodation: {
    bringOwnTent: boolean;
    rentedTents: TentSelection[];
  };
  addOns: string[];
  guestInfo: GuestInfo;
  pricing: PricingBreakdown;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface SiteConfig {
  domain: string;
  brandName: string;
  email: string;
  whatsapp: string;
  location: string;
  social: {
    instagram: string;
    facebook: string;
    tiktok?: string;
    tripadvisor?: string;
  };
}

export const SITE_CONFIG: SiteConfig = {
  domain: 'camping-puertoviejo-conchal.com',
  brandName: 'Camping Puerto Viejo Conchal',
  email: 'jj111w559@gmail.com',
  whatsapp: '+506 8303-4342',
  location: 'Camping Puerto Viejo Conchal, Guanacaste, Costa Rica',
  social: {
    instagram: 'https://www.instagram.com/camping.puertoviejo.conchal/',
    facebook: 'https://www.facebook.com/people/Camping-puerto-viejo-conchal-gunacaste/61580286042366/',
    tiktok: 'https://www.tiktok.com/@jorgejimenez7728888?_r=1&_t=ZS-94kf0Hv3JSf',
    tripadvisor: 'campingpuertoviejoconchal',
  },
};

export const PRICING = {
  campsitePerPersonPerNight: 14,
  tents: {
    'tent-2': 15,
    'tent-4': 25,
    'tent-6': 35,
  } as Record<string, number>,
  taxRate: 0.13,
};

export const TENT_OPTIONS: TentOption[] = [
  {
    id: 'tent-2',
    name: 'Cozy Duo',
    nameKey: 'tents.cozyDuo.name',
    capacity: 2,
    pricePerNight: 15,
    description: 'Perfect for couples or solo travelers who like space. Compact, waterproof, and surprisingly roomy.',
    descriptionKey: 'tents.cozyDuo.description',
    image: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773594991/Camping%20Puerto%20Viejo%20Conchal/Gallery/Tent%20rental/tienda2.jpg',
    icon: '🏕️',
  },
  {
    id: 'tent-4',
    name: 'Family Explorer',
    nameKey: 'tents.familyExplorer.name',
    capacity: 4,
    pricePerNight: 25,
    description: 'Room for the whole crew or friend group. Stand-up height, multiple ventilation windows, and covered vestibule.',
    descriptionKey: 'tents.familyExplorer.description',
    image: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773594991/Camping%20Puerto%20Viejo%20Conchal/Gallery/Tent%20rental/tienda3.jpg',
    icon: '🏕️',
  },
  {
    id: 'tent-6',
    name: 'Base Camp',
    nameKey: 'tents.baseCamp.name',
    capacity: 6,
    pricePerNight: 35,
    description: 'The luxury of space in the heart of nature. Perfect for families or groups who want to spread out.',
    descriptionKey: 'tents.baseCamp.description',
    image: 'https://res.cloudinary.com/da1sq9diw/image/upload/v1773594991/Camping%20Puerto%20Viejo%20Conchal/Gallery/Tent%20rental/tienda.jpg',
    icon: '🏕️',
  },
];

export const ADD_ONS: AddOn[] = [
  {
    id: 'breakfast',
    name: 'Breakfast Package',
    nameKey: 'addons.breakfast.name',
    price: 12,
    priceType: 'per-person',
    description: 'Fresh tropical fruits, gallo pinto, eggs, Costa Rican coffee. Fuel up for adventure.',
    descriptionKey: 'addons.breakfast.description',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400',
    icon: '🍳',
  },
  {
    id: 'kayak',
    name: 'Sunrise Kayak Tour',
    nameKey: 'addons.kayak.name',
    price: 35,
    priceType: 'per-person',
    description: 'Paddle through calm morning waters as the jungle wakes up. 2 hours of magic.',
    descriptionKey: 'addons.kayak.description',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    icon: '🛶',
  },
  {
    id: 'wildlife',
    name: 'Guided Wildlife Walk',
    nameKey: 'addons.wildlife.name',
    price: 25,
    priceType: 'per-person',
    description: 'Expert naturalist guide reveals hidden wildlife and shares jungle secrets. 2.5 hours.',
    descriptionKey: 'addons.wildlife.description',
    image: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=400',
    icon: '🦜',
  },
  {
    id: 'bonfire',
    name: 'Bonfire Kit',
    nameKey: 'addons.bonfire.name',
    price: 20,
    priceType: 'per-night',
    description: 'Firewood, marshmallows, chocolate, crackers. Everything for the perfect campfire night.',
    descriptionKey: 'addons.bonfire.description',
    image: 'https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=400',
    icon: '🔥',
  },
  {
    id: 'snorkel',
    name: 'Snorkel Gear Rental',
    nameKey: 'addons.snorkel.name',
    price: 15,
    priceType: 'per-day',
    description: 'Mask, snorkel, fins. Explore the underwater world at your own pace.',
    descriptionKey: 'addons.snorkel.description',
    image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=400',
    icon: '🤿',
  },
];

export const COUNTRIES = [
  'Costa Rica',
  'Argentina', 'Australia', 'Austria', 'Belgium', 'Bolivia', 'Brazil',
  'Canada', 'Chile', 'China', 'Colombia', 'Cuba', 'Czech Republic',
  'Denmark', 'Dominican Republic', 'Ecuador', 'El Salvador', 'Finland',
  'France', 'Germany', 'Greece', 'Guatemala', 'Honduras', 'Hungary',
  'India', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan',
  'Mexico', 'Netherlands', 'New Zealand', 'Nicaragua', 'Norway',
  'Panama', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Puerto Rico', 'Romania', 'Russia', 'South Africa', 'South Korea',
  'Spain', 'Sweden', 'Switzerland', 'Taiwan', 'Thailand',
  'Trinidad and Tobago', 'Turkey', 'Ukraine', 'United Kingdom',
  'United States', 'Uruguay', 'Venezuela',
  'Other',
];
