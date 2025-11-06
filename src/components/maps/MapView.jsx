import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../../hooks/useLocation';
import { useSocket } from '../../hooks/useSocket';
import axios from 'axios';
import { FiRefreshCw, FiFilter, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle map centering
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
};

const MapView = ({ 
  centers = [], 
  showCurrentLocation = true,
  showRadius = true,
  initialRadius = 10, // in km
  onMarkerClick,
  height = '400px',
  bloodTypeFilter = null,
  roleFilter = null
}) => {
  const { location: currentLocation, loading, refetch: refetchLocation } = useLocation(true);
  const { socket } = useSocket();
  const [liveUsers, setLiveUsers] = useState([]);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default New Delhi
  const [searchRadius, setSearchRadius] = useState(initialRadius);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapZoom, setMapZoom] = useState(13);

  // Fetch live users in range
  const fetchLiveUsers = async () => {
    if (!currentLocation) return;
    
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams({
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        radius: searchRadius,
        ...(roleFilter && { role: roleFilter }),
        ...(bloodTypeFilter && { bloodType: bloodTypeFilter })
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/blood/live-users?${params}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success) {
        setLiveUsers(response.data.data);
        toast.success(`Found ${response.data.count} users within ${searchRadius}km`);
      }
    } catch (error) {
      console.error('Failed to fetch live users:', error);
      toast.error('Failed to fetch nearby users');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentLocation && !loading) {
      setMapCenter([currentLocation.lat, currentLocation.lng]);
      fetchLiveUsers();
    }
  }, [currentLocation, loading, searchRadius]);

  useEffect(() => {
    if (!socket) return;

    // Listen for real-time location updates only from nearby users
    socket.on('user-location-updated', (data) => {
      // Only add/update if within current search radius
      if (data.distance && data.distance <= searchRadius) {
        setLiveUsers(prev => {
          const filtered = prev.filter(u => u._id !== data.userId);
          return [...filtered, {
            _id: data.userId,
            role: data.role,
            bloodType: data.bloodType,
            address: { coordinates: data.coordinates },
            distance: data.distance,
            isLive: true,
            lastSeen: new Date()
          }];
        });
      }
    });

    socket.on('user-offline', (userId) => {
      setLiveUsers(prev => prev.filter(u => u._id !== userId));
    });

    return () => {
      socket.off('user-location-updated');
      socket.off('user-offline');
    };
  }, [socket, searchRadius]);

  // Adjust zoom based on radius
  useEffect(() => {
    if (searchRadius <= 5) setMapZoom(14);
    else if (searchRadius <= 10) setMapZoom(13);
    else if (searchRadius <= 25) setMapZoom(12);
    else if (searchRadius <= 50) setMapZoom(11);
    else setMapZoom(10);
  }, [searchRadius]);

  const createCustomIcon = (type, isLive = false, distance = null) => {
    const colors = {
      donor: '#10b981',
      recipient: '#ef4444',
      delivery: '#3b82f6',
      bloodBank: '#f59e0b',
      current: '#8b5cf6'
    };

    const pulseAnimation = isLive ? `
      @keyframes pulse-${type} {
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
          position: relative;
          ${isLive ? `animation: pulse-${type} 2s infinite;` : ''}
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
          ${distance ? `
            <div style="
              position: absolute;
              bottom: -20px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0,0,0,0.8);
              color: white;
              padding: 2px 4px;
              border-radius: 3px;
              font-size: 10px;
              white-space: nowrap;
            ">
              ${distance}km
            </div>
          ` : ''}
        </div>
      `,
      iconSize: isLive ? [35, 35] : [30, 30],
      iconAnchor: isLive ? [17.5, 35] : [15, 30],
      popupAnchor: [0, -30]
    });
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden shadow-lg" style={{ height }}>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[90] space-y-2">
        {/* Radius Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
            Search Radius: {searchRadius}km
          </label>
          <select
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchLiveUsers}
          disabled={isRefreshing}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <FiRefreshCw className={`text-gray-700 dark:text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Live Users Count */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Live: {liveUsers.length}
          </p>
        </div>
      </div>

      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <MapController center={mapCenter} zoom={mapZoom} />
        
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
                  <button
                    onClick={refetchLocation}
                    className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    Update Location
                  </button>
                </div>
              </Popup>
            </Marker>
            
            {showRadius && (
              <Circle
                center={[currentLocation.lat, currentLocation.lng]}
                radius={searchRadius * 1000} // Convert km to meters
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

        {/* Live Users from API and Socket */}
        {liveUsers.map((user) => {
          const coords = user.address?.coordinates || user.coordinates;
          if (!coords) return null;

          return (
            <Marker
              key={user._id || user.userId}
              position={[coords.lat, coords.lng]}
              icon={createCustomIcon(user.role, true, user.distance)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'donor' ? 'bg-green-100 text-green-800' :
                      user.role === 'recipient' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.distance ? `${user.distance}km away` : 'Live'}
                    </span>
                  </div>
                  {user.name && <p className="font-semibold">{user.name}</p>}
                  <p className="text-sm">
                    Blood Type: <span className="font-semibold text-red-600">{user.bloodType}</span>
                  </p>
                  {user.lastSeen && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last seen: {new Date(user.lastSeen).toLocaleTimeString()}
                    </p>
                  )}
                  {user.donationCount !== undefined && (
                    <p className="text-xs text-gray-600 mt-1">
                      Donations: {user.donationCount} | Badge: {user.badgeLevel}
                    </p>
                  )}
                  {onMarkerClick && (
                    <button
                      onClick={() => onMarkerClick(user)}
                      className="mt-3 w-full bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Contact
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

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
