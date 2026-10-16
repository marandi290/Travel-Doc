import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    // Check secure context (localhost or HTTPS)
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setError('Geolocation requires a secure context (HTTPS). Localhost is supported for development.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp,
        });
        setIsLocating(false);
      },
      (err) => {
        let errorMsg = 'Failed to retrieve location.';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'Location permission was denied. Please allow location access in your browser.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'Location information is currently unavailable.';
            break;
          case err.TIMEOUT:
            errorMsg = 'The request to obtain your location timed out.';
            break;
          default:
            errorMsg = err.message || errorMsg;
            break;
        }
        setError(errorMsg);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // cache for 1 minute
      }
    );
  }, []);

  return {
    location,
    isLocating,
    error,
    getCurrentLocation,
    setLocation, // useful for testing or manual override
  };
}
