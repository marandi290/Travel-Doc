import { describe, it, expect } from 'vitest';
import { calculateHaversineDistanceKm, planFarthestFirstRoute } from './haversine.js';

describe('Frontend Haversine and Routing Heuristics', () => {
  it('calculates great-circle distance accurately', () => {
    // Tokyo (35.6762, 139.6503) to Kyoto (34.9671, 135.7727) ~ 370 km
    const dist = calculateHaversineDistanceKm(35.6762, 139.6503, 34.9671, 135.7727);
    expect(dist).toBeGreaterThan(350);
    expect(dist).toBeLessThan(390);
  });

  it('selects farthest destination as Stop #1', () => {
    const origin = { latitude: 0, longitude: 0 };
    const destinations = [
      { PlaceId: 'p1', Name: 'Place 1', Latitude: 1, Longitude: 1 },
      { PlaceId: 'p2', Name: 'Place 2', Latitude: 5, Longitude: 5 },
      { PlaceId: 'p3', Name: 'Place 3', Latitude: 30, Longitude: 30 },
    ];

    const result = planFarthestFirstRoute(origin, destinations);
    expect(result.length).toBe(3);
    expect(result[0].PlaceId).toBe('p3');
    expect(result[0].sequence).toBe(1);
    expect(result[0].isFarthestFirstStop).toBe(true);
  });
});
