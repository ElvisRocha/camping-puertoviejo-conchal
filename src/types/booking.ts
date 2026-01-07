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
  fullName: string;
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
    tripadvisor?: string;
  };
}

export const SITE_CONFIG: SiteConfig = {
  domain: 'camping-puertoviejo-conchal.com',
  brandName: 'Camping Puerto Viejo Conchal',
  email: 'hello@camping-puertoviejo-conchal.com',
  whatsapp: '+506 XXXX-XXXX',
  location: 'Puerto Viejo de Conchal, Guanacaste, Costa Rica',
  social: {
    instagram: '@campingpuertoviejo',
    facebook: '/campingpuertoviejoconchal',
    tripadvisor: 'campingpuertoviejoconchal',
  },
};

export const PRICING = {
  campsitePerPersonPerNight: 25,
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
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600',
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
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600',
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
    image: 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=600',
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
  'United States', 'Canada', 'Mexico', 'Germany', 'France', 'United Kingdom',
  'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland', 'Austria',
  'Australia', 'New Zealand', 'Japan', 'China', 'South Korea', 'Brazil',
  'Argentina', 'Chile', 'Colombia', 'Costa Rica', 'Panama', 'Other',
];
