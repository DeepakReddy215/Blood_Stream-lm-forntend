import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const useLocation = (autoUpdate = false, updateInterval = 30000) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateLocationInDB = useCallback(async (coords) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.put(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/blood/update-location`,
          {
            lat: coords.latitude,
            lng: coords.longitude
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
    } catch (error) {
      console.error('Failed to update location in database:', error);
    }
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        setLocation(newLocation);
        setLoading(false);
        setError(null);
        
        // Update location in database
        if (autoUpdate) {
          await updateLocationInDB(position.coords);
        }
      },
      (error) => {
        setError(error.message);
        setLoading(false);
        
        // Set default location if permission denied
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Please enable location services to see nearby donors');
          // Set default location (New Delhi, India)
          setLocation({
            lat: 28.6139,
            lng: 77.2090,
            accuracy: 0
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }, [autoUpdate, updateLocationInDB]);

  useEffect(() => {
    getCurrentLocation();

    // Set up interval for location updates if autoUpdate is enabled
    let intervalId;
    if (autoUpdate && updateInterval > 0) {
      intervalId = setInterval(getCurrentLocation, updateInterval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [getCurrentLocation, autoUpdate, updateInterval]);

  return { location, error, loading, refetch: getCurrentLocation };
};
