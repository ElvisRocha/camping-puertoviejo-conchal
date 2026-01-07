import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Campsite coordinates near Playa Conchal, Guanacaste, Costa Rica
const CAMPSITE_COORDINATES: [number, number] = [-85.81322062490392, 10.39059946466431];
const GOOGLE_MAPS_URL = `https://www.google.com/maps/dir/?api=1&destination=${CAMPSITE_COORDINATES[1]},${CAMPSITE_COORDINATES[0]}`;

interface ContactMapProps {
  accessToken: string;
}

export function ContactMap({ accessToken }: ContactMapProps) {
  const { t } = useTranslation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !accessToken) return;

    mapboxgl.accessToken = accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: CAMPSITE_COORDINATES,
      zoom: 13,
      pitch: 45,
      keyboard: false,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add marker for campsite
    const marker = new mapboxgl.Marker({
      color: '#2D5A27',
    })
      .setLngLat(CAMPSITE_COORDINATES)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-bold text-sm">Camping Puerto Viejo Conchal</h3>
            <p class="text-xs text-gray-600">Mapatalo, Puerto Viejo, Guanacaste</p>
          </div>
        `)
      )
      .addTo(map.current);

    // Open popup by default
    marker.togglePopup();

    return () => {
      map.current?.remove();
    };
  }, [accessToken]);

  if (!accessToken) {
    return (
      <div className="w-full h-full bg-muted rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground">Map loading...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" tabIndex={-1} style={{ outline: 'none' }} />
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
