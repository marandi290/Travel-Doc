/**
 * Haversine formula to compute great-circle distance between two points in kilometers.
 * @param {number} lat1 Latitude of point 1 in degrees
 * @param {number} lon1 Longitude of point 1 in degrees
 * @param {number} lat2 Latitude of point 2 in degrees
 * @param {number} lon2 Longitude of point 2 in degrees
 * @returns {number} Distance in kilometers
 */
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (angle) => (angle * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Plans a visiting sequence from an origin GPS point through a set of destinations.
 * Core Requirement:
 * 1. Calculate distance from origin to all candidate destinations.
 * 2. Pick the FARTHEST destination as Stop #1.
 * 3. Sequence remaining stops using a greedy Nearest-Neighbor heuristic from Stop #1 onwards.
 * 
 * @param {{ latitude: number, longitude: number }} origin Starting GPS coordinate
 * @param {Array<{ PlaceId: string, Name: string, Latitude: number, Longitude: number }>} destinations 
 * @returns {Array<Object>} Ordered stops with sequence numbers and straight-line distances
 */
export function planFarthestFirstRoute(origin, destinations) {
  if (!destinations || destinations.length === 0) return [];
  if (destinations.length === 1) {
    const single = destinations[0];
    const dist = calculateHaversineDistanceKm(
      origin.latitude,
      origin.longitude,
      Number(single.Latitude),
      Number(single.Longitude)
    );
    return [
      {
        ...single,
        sequence: 1,
        straightLineFromOriginKm: dist,
        straightLineLegKm: dist,
        isFarthestFirstStop: true,
      },
    ];
  }

  // Step 1: Compute straight line distance from origin to each destination
  const candidates = destinations.map((dest) => ({
    ...dest,
    distFromOrigin: calculateHaversineDistanceKm(
      origin.latitude,
      origin.longitude,
      Number(dest.Latitude),
      Number(dest.Longitude)
    ),
  }));

  // Step 2: Identify the farthest destination
  candidates.sort((a, b) => b.distFromOrigin - a.distFromOrigin);
  const farthest = candidates[0];

  const orderedStops = [];
  orderedStops.push({
    ...farthest,
    sequence: 1,
    straightLineFromOriginKm: farthest.distFromOrigin,
    straightLineLegKm: farthest.distFromOrigin,
    isFarthestFirstStop: true,
  });

  // Step 3: Order remaining destinations via nearest-neighbor starting from farthest
  const unvisited = candidates.slice(1);
  let currentLat = Number(farthest.Latitude);
  let currentLon = Number(farthest.Longitude);

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dest = unvisited[i];
      const d = calculateHaversineDistanceKm(
        currentLat,
        currentLon,
        Number(dest.Latitude),
        Number(dest.Longitude)
      );
      if (d < minDistance) {
        minDistance = d;
        nearestIdx = i;
      }
    }

    const nextStop = unvisited.splice(nearestIdx, 1)[0];
    orderedStops.push({
      ...nextStop,
      sequence: orderedStops.length + 1,
      straightLineFromOriginKm: nextStop.distFromOrigin,
      straightLineLegKm: minDistance,
      isFarthestFirstStop: false,
    });

    currentLat = Number(nextStop.Latitude);
    currentLon = Number(nextStop.Longitude);
  }

  return orderedStops;
}
