import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import LeafletMap from '../components/map/LeafletMap';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { wishlistApi } from '../services/api';
import { planFarthestFirstRoute } from '../utils/haversine';
import { getRoadRouteGeometry } from '../services/routingService';
import { useNotification } from '../context/NotificationContext';
import {
  IoNavigateOutline,
  IoLocationOutline,
  IoArrowUp,
  IoArrowDown,
  IoClose,
  IoRefreshOutline,
  IoInformationCircleOutline,
  IoCompassOutline,
  IoReturnDownBackOutline,
} from 'react-icons/io5';

export default function RoutePlanner() {
  const { currentLocation } = useOutletContext() || {};
  const { addNotification } = useNotification();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);

  // Fallback origin if browser GPS permission is not granted
  const [manualOrigin, setManualOrigin] = useState({
    latitude: 35.6762,
    longitude: 139.6503,
    name: 'Default Origin (Tokyo)',
  });
  const [useManualOrigin, setUseManualOrigin] = useState(false);

  // Planned route state
  const [orderedStops, setOrderedStops] = useState([]);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [roadMetrics, setRoadMetrics] = useState({ distanceKm: 0, durationMinutes: 0, isFallback: false });
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [hasManuallyReordered, setHasManuallyReordered] = useState(false);

  const activeOrigin =
    !useManualOrigin && currentLocation
      ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          name: 'Current GPS Location',
        }
      : manualOrigin;

  // Load pending wishlist items
  useEffect(() => {
    setIsLoadingWishlist(true);
    wishlistApi
      .getAll({ status: 'Pending' })
      .then((res) => {
        setWishlistItems(res.data || []);
      })
      .catch((err) => {
        addNotification(err.message || 'Failed to load wishlist items.', 'error');
      })
      .finally(() => {
        setIsLoadingWishlist(false);
      });
  }, []);

  // Compute Initial Route using Farthest-Stop-First + Nearest Neighbor
  const generateInitialRoute = async (candidates = wishlistItems) => {
    if (!candidates || candidates.length === 0) {
      setOrderedStops([]);
      setRoutePolyline([]);
      setRoadMetrics({ distanceKm: 0, durationMinutes: 0, isFallback: false });
      return;
    }

    setIsCalculatingRoute(true);
    try {
      // 1. Calculate heuristic sequence (Stop 1 = Farthest from origin)
      const sequencedStops = planFarthestFirstRoute(activeOrigin, candidates);
      setOrderedStops(sequencedStops);
      setHasManuallyReordered(false);

      // 2. Build waypoints starting from activeOrigin
      const waypoints = [activeOrigin, ...sequencedStops];

      // 3. Query OSRM road geometry
      const roadData = await getRoadRouteGeometry(waypoints);
      setRoutePolyline(roadData.coordinates);
      setRoadMetrics({
        distanceKm: roadData.distanceKm,
        durationMinutes: roadData.durationMinutes,
        isFallback: roadData.isFallback,
      });

      addNotification(
        `Route generated: Stop #1 set to furthest destination "${sequencedStops[0]?.Name}".`,
        'success'
      );
    } catch (err) {
      addNotification('Error calculating road route geometry.', 'error');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Re-calculate route when user re-orders or removes stops
  const recalculateFromCurrentStops = async (currentStopsList) => {
    if (currentStopsList.length === 0) {
      setOrderedStops([]);
      setRoutePolyline([]);
      setRoadMetrics({ distanceKm: 0, durationMinutes: 0, isFallback: false });
      return;
    }

    setIsCalculatingRoute(true);
    try {
      const waypoints = [activeOrigin, ...currentStopsList];
      const roadData = await getRoadRouteGeometry(waypoints);
      setRoutePolyline(roadData.coordinates);
      setRoadMetrics({
        distanceKm: roadData.distanceKm,
        durationMinutes: roadData.durationMinutes,
        isFallback: roadData.isFallback,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleMoveStop = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= orderedStops.length) return;

    const updated = [...orderedStops];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);

    // Re-assign sequence numbers
    const resequenced = updated.map((stop, i) => ({
      ...stop,
      sequence: i + 1,
      isFarthestFirstStop: i === 0 && !hasManuallyReordered,
    }));

    setHasManuallyReordered(true);
    setOrderedStops(resequenced);
    recalculateFromCurrentStops(resequenced);
  };

  const handleRemoveStop = (index) => {
    const updated = orderedStops.filter((_, i) => i !== index);
    const resequenced = updated.map((stop, i) => ({
      ...stop,
      sequence: i + 1,
      isFarthestFirstStop: i === 0 && !hasManuallyReordered,
    }));

    setOrderedStops(resequenced);
    recalculateFromCurrentStops(resequenced);
  };

  if (isLoadingWishlist) {
    return <LoadingSpinner size="lg" message="Loading destinations for route planning..." />;
  }

  // Calculate total straight-line distance for comparison
  const totalStraightLineDistanceKm = orderedStops.reduce((acc, stop) => {
    return acc + (stop.straightLineLegKm || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Route Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-terracotta-700 text-white flex items-center justify-center shadow-xs">
              <IoNavigateOutline className="w-5 h-5" aria-hidden="true" />
            </span>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Multi-Stop Route Planner
            </h2>
          </div>
          <p className="text-xs text-stone-600 font-medium mt-1">
            Origins from your GPS, journeys to the farthest destination first, and optimizes the return circuit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasManuallyReordered && (
            <Button
              onClick={() => generateInitialRoute(wishlistItems)}
              variant="outline"
              size="sm"
              icon={IoReturnDownBackOutline}
            >
              Reset Farthest-First
            </Button>
          )}
          <Button
            onClick={() => generateInitialRoute(wishlistItems)}
            variant="primary"
            size="sm"
            disabled={isCalculatingRoute || wishlistItems.length === 0}
            loading={isCalculatingRoute}
            icon={IoRefreshOutline}
          >
            Generate Itinerary
          </Button>
        </div>
      </div>

      {/* Origin Info & Farthest-First Rationale Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Origin Card */}
        <Card className="p-4 flex items-start gap-3 bg-white">
          <IoLocationOutline className="w-6 h-6 text-forest-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs min-w-0">
            <div className="font-bold text-stone-900">Trip Origin</div>
            <div className="text-stone-700 font-semibold truncate">{activeOrigin.name}</div>
            <div className="text-stone-500 font-mono text-[11px] mt-0.5">
              {Number(activeOrigin.latitude).toFixed(4)}°, {Number(activeOrigin.longitude).toFixed(4)}°
            </div>
            {!currentLocation && !useManualOrigin && (
              <button
                type="button"
                onClick={() => setUseManualOrigin(true)}
                className="text-forest-800 underline text-[11px] mt-1 font-bold hover:text-forest-950"
              >
                Use custom location
              </button>
            )}
          </div>
        </Card>

        {/* Farthest-First Rule Explanation */}
        <Card className="p-4 flex items-start gap-3 bg-amber-50/70 border-amber-200 md:col-span-2">
          <IoInformationCircleOutline className="w-6 h-6 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-amber-950">
            <div className="font-bold text-amber-950">
              Product Specification: Farthest Destination First
            </div>
            <p className="mt-0.5 leading-relaxed text-amber-900">
              Your itinerary begins at your origin and journeys to the <strong>furthest unvisited destination</strong> (Stop #1). From there, it explores neighboring destinations in logical sequence on the return journey.
            </p>
          </div>
        </Card>
      </div>

      {/* Metrics Row (when route is calculated) */}
      {orderedStops.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">Total Stops</div>
            <div className="text-2xl font-extrabold text-stone-900 mt-1">
              {orderedStops.length} Places
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">Road Distance</div>
            <div className="text-2xl font-extrabold text-forest-800 mt-1">
              {roadMetrics.distanceKm > 0 ? `${roadMetrics.distanceKm} km` : 'Calculating...'}
            </div>
            {roadMetrics.isFallback && (
              <div className="text-[10px] text-amber-800 font-medium mt-0.5">Geodesic approximation</div>
            )}
          </Card>

          <Card className="p-4">
            <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">Est. Drive Time</div>
            <div className="text-2xl font-extrabold text-stone-900 mt-1">
              {roadMetrics.durationMinutes > 0
                ? `${Math.floor(roadMetrics.durationMinutes / 60)}h ${roadMetrics.durationMinutes % 60}m`
                : 'N/A'}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">Straight-Line Sum</div>
            <div className="text-2xl font-extrabold text-stone-700 mt-1">
              {Math.round(totalStraightLineDistanceKm)} km
            </div>
            <div className="text-[10px] text-stone-500 font-medium">Haversine great-circle</div>
          </Card>
        </div>
      )}

      {/* Two Column Layout: Ordered Stops List & Route Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stops List (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">Itinerary Stops</h3>
            <span className="text-xs text-stone-500">Use arrows to adjust order</span>
          </div>

          {orderedStops.length === 0 ? (
            <EmptyState
              icon={IoCompassOutline}
              title="No active route generated"
              description="Click 'Generate Itinerary' to sequence your wishlist destinations starting with the farthest stop first."
              actionLabel="Calculate Route Now"
              onAction={() => generateInitialRoute(wishlistItems)}
            />
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {/* Origin item */}
              <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-stone-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  0
                </span>
                <div className="text-xs min-w-0">
                  <div className="font-bold text-stone-900 truncate">{activeOrigin.name}</div>
                  <div className="text-stone-600 font-medium">Departure Origin</div>
                </div>
              </div>

              {/* Ordered Stops */}
              {orderedStops.map((stop, index) => (
                <div
                  key={`stop-${stop.PlaceId}-${index}`}
                  className={`p-3.5 rounded-xl border transition-all ${
                    stop.isFarthestFirstStop
                      ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-white border-stone-200 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 ${
                          stop.isFarthestFirstStop ? 'bg-terracotta-700' : 'bg-forest-800'
                        }`}
                      >
                        {stop.sequence}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-stone-900 truncate">{stop.Name}</div>
                        <div className="text-xs text-stone-600 font-medium truncate">
                          {stop.City ? `${stop.City}, ` : ''}{stop.Country}
                        </div>
                        {stop.isFarthestFirstStop && (
                          <div className="mt-1.5">
                            <Badge variant="farthest" size="sm">
                              Stop 1: Furthest Destination ({stop.straightLineFromOriginKm} km)
                            </Badge>
                          </div>
                        )}
                        {!stop.isFarthestFirstStop && (
                          <div className="text-[11px] text-stone-600 mt-1 font-medium">
                            Leg: ~{stop.straightLineLegKm} km from previous stop
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reorder and Delete controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveStop(index, -1)}
                        disabled={index === 0}
                        title="Move Up"
                        aria-label={`Move ${stop.Name} up in itinerary`}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
                      >
                        <IoArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStop(index, 1)}
                        disabled={index === orderedStops.length - 1}
                        title="Move Down"
                        aria-label={`Move ${stop.Name} down in itinerary`}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
                      >
                        <IoArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(index)}
                        title="Remove Stop"
                        aria-label={`Remove ${stop.Name} from route`}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                      >
                        <IoClose className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Route Map (7 cols on lg) */}
        <div className="lg:col-span-7 h-[600px] sticky top-20">
          <LeafletMap
            routeStops={orderedStops}
            routePolyline={routePolyline}
            currentLocation={currentLocation}
            className="h-full"
            showLegend={true}
          />
        </div>
      </div>
    </div>
  );
}
