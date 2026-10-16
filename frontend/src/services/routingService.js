import axios from 'axios';

/**
 * Requests actual road routing geometry and distances from OSRM.
 * 
 * @param {Array<{ latitude: number, longitude: number }>} waypoints Ordered list of points
 * @returns {Promise<{ success: boolean, coordinates: Array<[number, number]>, distanceKm: number, durationMinutes: number, isFallback: boolean }>}
 */
export async function getRoadRouteGeometry(waypoints) {
  if (!waypoints || waypoints.length < 2) {
    return {
      success: false,
      coordinates: [],
      distanceKm: 0,
      durationMinutes: 0,
      isFallback: false,
    };
  }

  // OSRM requires format: {lon},{lat};{lon},{lat}...
  const coordString = waypoints
    .map((wp) => `${Number(wp.longitude).toFixed(6)},${Number(wp.latitude).toFixed(6)}`)
    .join(';');

  const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson&steps=false`;

  try {
    const res = await axios.get(url, { timeout: 10000 });
    if (res.data?.code === 'Ok' && res.data.routes?.length > 0) {
      const primaryRoute = res.data.routes[0];
      // GeoJSON coordinates come as [lon, lat], Leaflet polyline expects [lat, lon]
      const latLngPoints = primaryRoute.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
      const distanceKm = Math.round((primaryRoute.distance / 1000) * 10) / 10;
      const durationMinutes = Math.round(primaryRoute.duration / 60);

      return {
        success: true,
        coordinates: latLngPoints,
        distanceKm,
        durationMinutes,
        isFallback: false,
      };
    }
  } catch (err) {
    console.warn('OSRM routing request failed, using straight-line fallback:', err.message);
  }

  // Fallback: Return direct straight line coordinates
  const straightLinePoints = waypoints.map((wp) => [Number(wp.latitude), Number(wp.longitude)]);
  return {
    success: true,
    coordinates: straightLinePoints,
    distanceKm: 0,
    durationMinutes: 0,
    isFallback: true,
  };
}
