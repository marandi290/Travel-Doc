import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHaversineKm,
  sequenceFarthestFirst,
} from '../../src/services/routePlannerService.js';

describe('Route Planner & Haversine Distance Tests', () => {
  it('should accurately calculate Haversine distance between New York and London (~5570 km)', () => {
    // New York: 40.7128° N, 74.0060° W
    // London: 51.5074° N, 0.1278° W
    const dist = calculateHaversineKm(40.7128, -74.006, 51.5074, -0.1278);
    assert.ok(dist >= 5560 && dist <= 5585, `Expected ~5570 km, got ${dist}`);
  });

  it('should return 0 km for identical coordinates', () => {
    const dist = calculateHaversineKm(35.6762, 139.6503, 35.6762, 139.6503);
    assert.equal(dist, 0);
  });

  it('should designate the farthest destination as Stop #1', () => {
    const origin = { latitude: 0, longitude: 0, name: 'Null Island' };

    const destinations = [
      { PlaceId: 'A', Name: 'Near Place', Latitude: 1, Longitude: 1 },
      { PlaceId: 'B', Name: 'Medium Place', Latitude: 10, Longitude: 10 },
      { PlaceId: 'C', Name: 'Farthest Place', Latitude: 50, Longitude: 50 },
    ];

    const stops = sequenceFarthestFirst(origin, destinations);

    assert.equal(stops.length, 3);
    assert.equal(stops[0].PlaceId, 'C', 'Stop 1 must be the farthest destination');
    assert.equal(stops[0].sequence, 1);
    assert.equal(stops[0].isFarthestFirstStop, true);
    assert.equal(stops[1].isFarthestFirstStop, false);
    assert.equal(stops[2].isFarthestFirstStop, false);
  });

  it('should handle single destination correctly', () => {
    const origin = { latitude: 40.7128, longitude: -74.006 };
    const destinations = [{ PlaceId: 'X', Name: 'Solo Stop', Latitude: 34.0522, Longitude: -118.2437 }];

    const stops = sequenceFarthestFirst(origin, destinations);
    assert.equal(stops.length, 1);
    assert.equal(stops[0].sequence, 1);
    assert.equal(stops[0].isFarthestFirstStop, true);
  });

  it('should return an empty list when no destinations are provided', () => {
    const origin = { latitude: 40.7128, longitude: -74.006 };
    const stops = sequenceFarthestFirst(origin, []);
    assert.deepEqual(stops, []);
  });
});
