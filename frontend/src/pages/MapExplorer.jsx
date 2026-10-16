import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import LeafletMap from '../components/map/LeafletMap';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LogVisitModal from '../components/places/LogVisitModal';
import { wishlistApi, visitsApi } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import {
  IoLocationOutline,
  IoCalendarOutline,
  IoStar,
} from 'react-icons/io5';

export default function MapExplorer() {
  const { currentLocation } = useOutletContext() || {};
  const { addNotification } = useNotification();

  const [places, setPlaces] = useState([]);
  const [filterMode, setFilterMode] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [visitingPlace, setVisitingPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMapData = async () => {
    setIsLoading(true);
    try {
      const [wishRes, visitRes] = await Promise.allSettled([
        wishlistApi.getAll({ status: 'Pending' }),
        visitsApi.getAll(),
      ]);

      const list = [];
      const visitedPlaceIds = new Set();

      if (visitRes.status === 'fulfilled') {
        const visits = visitRes.value.data || [];
        visits.forEach((v) => {
          visitedPlaceIds.add(v.PlaceId);
          list.push({
            PlaceId: v.PlaceId,
            Name: v.PlaceName || v.Name,
            City: v.City,
            Country: v.Country,
            Latitude: v.Latitude,
            Longitude: v.Longitude,
            Category: v.Category,
            Notes: v.Notes,
            isVisited: true,
            VisitDate: v.VisitDate,
            Rating: v.Rating,
          });
        });
      }

      if (wishRes.status === 'fulfilled') {
        const wish = wishRes.value.data || [];
        wish.forEach((w) => {
          if (!visitedPlaceIds.has(w.PlaceId)) {
            list.push({
              ...w,
              isVisited: false,
            });
          }
        });
      }

      setPlaces(list);
    } catch (err) {
      addNotification(err.message || 'Failed to load map places.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  const visibleMarkers = useMemo(() => {
    if (filterMode === 'wishlist') return places.filter((p) => !p.isVisited);
    if (filterMode === 'visited') return places.filter((p) => p.isVisited);
    return places;
  }, [places, filterMode]);

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading map explorer..." />;
  }

  const wishlistCount = places.filter((p) => !p.isVisited).length;
  const visitedCount = places.filter((p) => p.isVisited).length;

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900 leading-tight">Interactive Map Explorer</h2>
          <p className="text-xs text-stone-600 font-medium mt-0.5">
            Displaying {visibleMarkers.length} destinations across the globe
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 ${
              filterMode === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All ({places.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('wishlist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 ${
              filterMode === 'wishlist'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-forest-500 inline-block" aria-hidden="true" />
            Wishlist ({wishlistCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('visited')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
              filterMode === 'visited'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" aria-hidden="true" />
            Visited ({visitedCount})
          </button>
        </div>
      </div>

      {/* Main Map Canvas & Place Inspector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Container */}
        <div className="lg:col-span-3 h-[600px]">
          <LeafletMap
            markers={visibleMarkers}
            selectedPlace={selectedPlace}
            onSelectPlace={(p) => setSelectedPlace(p)}
            currentLocation={currentLocation}
            className="h-full"
            showLegend={true}
          />
        </div>

        {/* Selected Place Details Inspector Card */}
        <div className="lg:col-span-1 space-y-3">
          {selectedPlace ? (
            <Card className="space-y-3 sticky top-20 border-stone-200">
              <div className="flex items-start justify-between gap-2">
                <Badge variant={selectedPlace.isVisited ? 'visited' : 'high'} size="sm">
                  {selectedPlace.isVisited ? 'Visited' : selectedPlace.Priority || 'Wishlist'}
                </Badge>
                {selectedPlace.Category && (
                  <Badge variant="category" size="sm">
                    {selectedPlace.Category}
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="font-bold text-stone-900 text-lg leading-tight">
                  {selectedPlace.Name}
                </h3>
                <p className="text-xs text-stone-600 font-medium mt-1">
                  {selectedPlace.City ? `${selectedPlace.City}, ` : ''}{selectedPlace.Country}
                </p>
                <div className="text-[11px] font-mono text-stone-500 font-medium mt-1">
                  {Number(selectedPlace.Latitude).toFixed(4)}°, {Number(selectedPlace.Longitude).toFixed(4)}°
                </div>
              </div>

              {selectedPlace.isVisited && selectedPlace.VisitDate && (
                <div className="text-xs text-teal-900 bg-teal-50 border border-teal-200 rounded-lg p-2.5 space-y-1 font-medium">
                  <div className="flex items-center gap-1.5">
                    <IoCalendarOutline className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
                    <span>Visited: {new Date(selectedPlace.VisitDate).toLocaleDateString()}</span>
                  </div>
                  {selectedPlace.Rating && (
                    <div className="flex items-center text-amber-500 gap-0.5">
                      {[...Array(selectedPlace.Rating)].map((_, i) => (
                        <IoStar key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedPlace.Notes && (
                <p className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-lg italic border-l-2 border-forest-700 leading-relaxed">
                  "{selectedPlace.Notes}"
                </p>
              )}

              <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
                {!selectedPlace.isVisited && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => setVisitingPlace(selectedPlace)}
                  >
                    Mark as Visited
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedPlace(null)}
                >
                  Clear Selection
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-14 px-4 text-stone-500 text-xs leading-relaxed border-stone-200">
              <IoLocationOutline className="w-8 h-8 mx-auto mb-2 text-stone-400" aria-hidden="true" />
              <p className="font-semibold text-stone-700 mb-1">Select a Destination</p>
              Click any pin on the map to inspect destination details, notes, and memoirs.
            </Card>
          )}
        </div>
      </div>

      {/* Log Visit Modal */}
      <LogVisitModal
        isOpen={Boolean(visitingPlace)}
        place={visitingPlace}
        onClose={() => setVisitingPlace(null)}
        onSuccess={() => {
          fetchMapData();
          setSelectedPlace(null);
        }}
      />
    </div>
  );
}
