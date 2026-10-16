import { wishlistRepository } from '../repositories/wishlistRepository.js';

/**
 * Calculates great-circle Haversine distance in kilometers
 */
export function calculateHaversineKm(lat1, lon1, lat2, lon2) {
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
 * Sequences destinations according to the mandatory product rule:
 * 1. Farthest destination from starting origin is selected as Stop #1.
 * 2. Remaining stops are sequenced via greedy Nearest-Neighbor.
 */
export function sequenceFarthestFirst(origin, destinations) {
  if (!destinations || destinations.length === 0) return [];
  if (destinations.length === 1) {
    const single = destinations[0];
    const dist = calculateHaversineKm(
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

  // Calculate distance from origin to all candidate destinations
  const candidates = destinations.map((d) => ({
    ...d,
    distFromOrigin: calculateHaversineKm(
      origin.latitude,
      origin.longitude,
      Number(d.Latitude),
      Number(d.Longitude)
    ),
  }));

  // Identify farthest destination
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

  // Nearest neighbor for remaining
  const unvisited = candidates.slice(1);
  let curLat = Number(farthest.Latitude);
  let curLon = Number(farthest.Longitude);

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minD = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const d = calculateHaversineKm(
        curLat,
        curLon,
        Number(unvisited[i].Latitude),
        Number(unvisited[i].Longitude)
      );
      if (d < minD) {
        minD = d;
        nearestIdx = i;
      }
    }

    const next = unvisited.splice(nearestIdx, 1)[0];
    orderedStops.push({
      ...next,
      sequence: orderedStops.length + 1,
      straightLineFromOriginKm: next.distFromOrigin,
      straightLineLegKm: minD,
      isFarthestFirstStop: false,
    });

    curLat = Number(next.Latitude);
    curLon = Number(next.Longitude);
  }

  return orderedStops;
}

export const routePlannerService = {
  async planRoute({ origin, destinationIds = [] }) {
    if (!origin || typeof origin.latitude !== 'number' || typeof origin.longitude !== 'number') {
      const err = new Error('Origin coordinates (latitude, longitude) are required.');
      err.statusCode = 400;
      err.code = 'INVALID_ORIGIN';
      throw err;
    }

    // Retrieve active wishlist items
    let candidates = await wishlistRepository.findAll({ status: 'Pending' });

    if (destinationIds && destinationIds.length > 0) {
      candidates = candidates.filter((c) => destinationIds.includes(c.PlaceId));
    }

    if (candidates.length === 0) {
      return {
        origin,
        stops: [],
        totalRoadDistanceKm: 0,
        estimatedDurationMinutes: 0,
        isFallback: false,
      };
    }

    // Sequence with farthest first
    const stops = sequenceFarthestFirst(origin, candidates);
    return {
      origin,
      stops,
      totalStops: stops.length,
      farthestStop: stops[0] || null,
    };
  },
};
