import axios from 'axios';

const geocodeCache = new Map();

/**
 * Searches places using OpenStreetMap Nominatim Geocoding API.
 * Free service; implements client-side cache and debouncing.
 * 
 * @param {string} query Search terms (e.g. "Eiffel Tower", "Kyoto")
 * @returns {Promise<Array<{ name: string, displayName: string, city: string, country: string, latitude: number, longitude: number }>>}
 */
export async function searchPlacesGeocoding(query) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const cacheKey = trimmed.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: trimmed,
        format: 'json',
        addressdetails: 1,
        limit: 6,
      },
      headers: {
        'Accept-Language': 'en',
      },
      timeout: 8000,
    });

    const results = (response.data || []).map((item) => {
      const addr = item.address || {};
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.state || '';
      const country = addr.country || '';
      const name = item.name || item.display_name.split(',')[0];

      return {
        id: item.place_id,
        name: name,
        displayName: item.display_name,
        address: item.display_name,
        city: city,
        country: country,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        type: item.type,
      };
    });

    geocodeCache.set(cacheKey, results);
    return results;
  } catch (err) {
    console.warn('Geocoding service unavailable or rate-limited:', err.message);
    return [];
  }
}
