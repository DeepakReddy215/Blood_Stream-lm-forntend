import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapView = ({ centers = [], currentLocation }) => {
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default to New Delhi
  const [detectedLocation, setDetectedLocation] = useState(null);

  useEffect(() => {
    if (currentLocation) {
      setMapCenter([currentLocation.lat, currentLocation.lng]);
    }
  }, [currentLocation]);

  // Attempt to center the map using browser geolocation when no location prop is provided
  useEffect(() => {
    if (!currentLocation && typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDetectedLocation({ lat: latitude, lng: longitude });
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.warn('Unable to retrieve current location', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    }
  }, [currentLocation]);

  const activeLocation = currentLocation || detectedLocation;

  const createCustomIcon = (type) => {
    const colors = {
      donor: '#10b981',
      recipient: '#ef4444',
      delivery: '#3b82f6',
      bloodBank: '#f59e0b',
      current: '#8b5cf6'
    };

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${colors[type] || '#666'};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {/* Current Location Marker */}
        {activeLocation && (
          <>
            <Marker 
              position={[activeLocation.lat, activeLocation.lng]}
              icon={createCustomIcon('current')}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Your Current Location</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[activeLocation.lat, activeLocation.lng]}
              radius={500}
              pathOptions={{ 
                fillColor: '#8b5cf6', 
                fillOpacity: 0.1,
                color: '#8b5cf6',
                weight: 2
              }}
            />
          </>
        )}

        {/* Center Markers */}
        {centers.map((center, index) => (
          <Marker
            key={index}
            position={[center.lat || center.coordinates?.lat || 28.6139, 
                      center.lng || center.coordinates?.lng || 77.2090]}
            icon={createCustomIcon(center.type)}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold">{center.name}</p>
                {center.address && <p className="text-sm">{center.address}</p>}
                {center.bloodType && (
                  <p className="text-sm mt-1">
                    Blood Type: <span className="font-semibold text-red-600">{center.bloodType}</span>
                  </p>
                )}
                {center.phone && <p className="text-sm">Contact: {center.phone}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
