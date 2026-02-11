import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

interface GoogleMapComponentProps {
  className?: string;
  showDirectionsButton?: boolean;
}

const GoogleMapComponent = ({
  className,
  showDirectionsButton = true
}: GoogleMapComponentProps) => {
  // Coordenadas exactas de Camping Puerto Viejo Conchal
  const position = {
    lat: 10.390279144185165,
    lng: -85.81323950164672
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`;
    window.open(url, '_blank');
  };

  if (!apiKey) {
    console.error('Google Maps API Key no encontrada en variables de entorno');
    return (
      <div className={className}>
        <p className="text-red-500 text-center p-4">
          Error: Configuraci&oacute;n de mapa no disponible.
          Verifica la variable VITE_GOOGLE_MAPS_API_KEY en .env
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={position}
          defaultZoom={15}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          className={className}
          mapTypeId="roadmap"
        >
          <Marker
            position={position}
            title="Camping Puerto Viejo Conchal"
          />
        </Map>
      </APIProvider>

      {showDirectionsButton && (
        <button
          onClick={openDirections}
          className="absolute bottom-4 right-4 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors z-10"
          aria-label="Abrir direcciones en Google Maps"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          C&oacute;mo Llegar
        </button>
      )}
    </div>
  );
};

export default GoogleMapComponent;
