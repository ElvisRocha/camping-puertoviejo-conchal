import { useTranslation } from 'react-i18next';
import { Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

// Campsite coordinates - Camping Puerto Viejo Conchal, Guanacaste, Costa Rica
const CAMPSITE_POSITION = {
  lat: 10.390279144185165,
  lng: -85.81323950164672,
};
const GOOGLE_MAPS_URL = `https://www.google.com/maps/dir/?api=1&destination=${CAMPSITE_POSITION.lat},${CAMPSITE_POSITION.lng}`;

export function ContactMap() {
  const { t } = useTranslation();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-full bg-muted rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground">Map configuration unavailable</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={CAMPSITE_POSITION}
          defaultZoom={15}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          mapTypeId="roadmap"
          style={{ width: '100%', height: '100%' }}
        >
          <Marker
            position={CAMPSITE_POSITION}
            title="Camping Puerto Viejo Conchal"
          />
        </Map>
      </APIProvider>
      <a
        href={GOOGLE_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 z-10"
      >
        <Button className="shadow-lg gap-2">
          <Navigation className="w-4 h-4" />
          {t('contact.map.getDirections')}
        </Button>
      </a>
    </div>
  );
}
