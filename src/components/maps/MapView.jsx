import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../../hooks/useLocation';
import { useSocket } from '../../hooks/useSocket';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle map centering
const MapController = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

const MapView = ({ 
  centers = [], 
  showCurrentLocation = true,
  showRadius = true,
  radius = 5000, // in meters
  onMarkerClick,
  height = '400px'
}) => {
  const { location: currentLocation, loading } = useLocation(true);
  const { socket } = useSocket();
  const [liveUsers, setLiveUsers] = useState([]);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default New Delhi

  useEffect(() => {
    if (currentLocation && !loading) {
      setMapCenter([currentLocation.lat, currentLocation.lng]);
    }
  }, [currentLocation, loading]);

  useEffect(() => {
    if (!socket) return;

    // Listen for real-time location updates
    socket.on('user-location-updated', (data) => {
      setLiveUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        return [...filtered, data];
      });
    });

    return () => {
      socket.off('user-location-updated');
    };
  }, [socket]);

  const createCustomIcon = (type, isLive = false) => {
    const colors = {
      donor: '#10b981',
      recipient: '#ef4444',
      delivery: '#3b82f6',
      bloodBank: '#f59e0b',
      current: '#8b5cf6'
    };

    const pulseAnimation = isLive ? `
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(${type === 'donor' ? '16, 185, 129' : '239, 68, 68'}, 0.7); }
        70% { box-shadow: 0 0 0 20px rgba(${type === 'donor' ? '16, 185, 129' : '239, 68, 68'}, 0); }
        100% { box-shadow: 0 0 0 0 rgba(${type === 'donor' ? '16, 185, 129' : '239, 68, 68'}, 0); }
      }
    ` : '';

    return L.divIcon({
      className: 'custom-marker',
      html: `
        ${isLive ? `<style>${pulseAnimation}</style>` : ''}
        <div style="
          background-color: ${colors[type] || '#666'};
          width: ${isLive ? '35px' : '30px'};
          height: ${isLive ? '35px' : '30px'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          ${isLive ? 'animation: pulse 2s infinite;' : ''}
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            ${type === 'donor' ? 
              '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>' :
              type === 'recipient' ?
              '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>' :
              type === 'bloodBank' ?
              '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>' :
              '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>'
            }
          </svg>
        </div>
      `,
      iconSize: isLive ? [35, 35] : [30, 30],
      iconAnchor: isLive ? [17.5, 35] : [15, 30],
      popupAnchor: [0, -30]
    });
  };

  return (
    <div className="w-full rounded-lg overflow-hidden" style={{ height }}>
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
        
        <MapController center={mapCenter} />
        
        {/* Current User Location */}
        {showCurrentLocation && currentLocation && (
          <>
            <Marker 
              position={[currentLocation.lat, currentLocation.lng]}
              icon={createCustomIcon('current')}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Your Current Location</p>
                  <p className="text-sm text-gray-600">
                    Accuracy: ±{Math.round(currentLocation.accuracy)}m
                  </p>
                </div>
              </Popup>
            </Marker>
            
            {showRadius && (
              <Circle
                center={[currentLocation.lat, currentLocation.lng]}
                radius={radius}
                pathOptions={{ 
                  fillColor: '#8b5cf6', 
                  fillOpacity: 0.05,
                  color: '#8b5cf6',
                  weight: 2,
                  dashArray: '5, 10'
                }}
              />
            )}
          </>
        )}

        {/* Live Users from Socket */}
        {liveUsers.map((user) => (
          <Marker
            key={user.userId}
            position={[user.coordinates.lat, user.coordinates.lng]}
            icon={createCustomIcon(user.role, true)}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold">Live {user.role}</p>
                <p className="text-sm">Blood Type: {user.bloodType}</p>
                <p className="text-xs text-gray-500">Active now</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Static Centers/Markers */}
        {centers.map((center, index) => {
          const position = [
            center.lat || center.coordinates?.lat || center.location?.lat || 28.6139,
            center.lng || center.coordinates?.lng || center.location?.lng || 77.2090
          ];

          return (
            <Marker
              key={index}
              position={position}
              icon={createCustomIcon(center.type || 'donor')}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(center)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <p className="font-semibold text-lg">{center.name}</p>
                  {center.address && (
                    <p className="text-sm text-gray-600 mt-1">{center.address}</p>
                  )}
                  {center.bloodType && (
                    <p className="text-sm mt-2">
                      Blood Type: <span className="font-semibold text-red-600">{center.bloodType}</span>
                    </p>
                  )}
                  {center.distance !== undefined && (
                    <p className="text-sm">
                      Distance: <span className="font-semibold">{center.distance.toFixed(1)} km</span>
                    </p>
                  )}
                  {center.phone && (
                    <p className="text-sm mt-2">
                      Contact: <a href={`tel:${center.phone}`} className="text-blue-600">{center.phone}</a>
                    </p>
                  )}
                  {center.donationCount !== undefined && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-gray-600">
                        Donations: {center.donationCount} | Badge: {center.badgeLevel}
                      </p>
                    </div>
                  )}
                  {onMarkerClick && (
                    <button
                      onClick={() => onMarkerClick(center)}
                      className="mt-3 w-full bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
