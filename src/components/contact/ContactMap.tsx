import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Campsite coordinates near Playa Conchal, Guanacaste, Costa Rica
const CAMPSITE_COORDINATES: [number, number] = [-85.8012, 10.4066];

interface ContactMapProps {
  accessToken: string;
}

export function ContactMap({ accessToken }: ContactMapProps) {
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
            <p class="text-xs text-gray-600">Playa Conchal, Guanacaste</p>
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
    <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
}
