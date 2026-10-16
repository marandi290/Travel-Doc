import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import WishlistCard from '../components/places/WishlistCard';
import LogVisitModal from '../components/places/LogVisitModal';
import LeafletMap from '../components/map/LeafletMap';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Input from '../components/common/Input';
import { wishlistApi } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { calculateHaversineDistanceKm } from '../utils/haversine';
import {
  IoSearch,
  IoBookmarkOutline,
  IoMapOutline,
  IoListOutline,
} from 'react-icons/io5';

const CATEGORIES = ['All', 'Nature', 'Culture', 'Historic', 'Adventure', 'Culinary', 'Urban'];
const PRIORITIES = ['All', 'High', 'Medium', 'Low'];

export default function Wishlist() {
  const { currentLocation, refreshTrigger } = useOutletContext() || {};
  const { addNotification } = useNotification();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('priority');
  const [viewMode, setViewMode] = useState('split');

  const [selectedPlaceForMap, setSelectedPlaceForMap] = useState(null);
  const [visitingPlace, setVisitingPlace] = useState(null);

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const res = await wishlistApi.getAll({ status: 'Pending' });
      setItems(res.data || []);
    } catch (err) {
      addNotification(err.message || 'Failed to load wishlist items.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [refreshTrigger]);

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Remove "${item.Name}" from your wishlist?`)) return;
    try {
      await wishlistApi.delete(item.WishlistItemId);
      addNotification(`Removed "${item.Name}" from wishlist.`, 'success');
      setItems((prev) => prev.filter((i) => i.WishlistItemId !== item.WishlistItemId));
      if (selectedPlaceForMap?.WishlistItemId === item.WishlistItemId) {
        setSelectedPlaceForMap(null);
      }
    } catch (err) {
      addNotification(err.message || 'Failed to remove wishlist item.', 'error');
    }
  };

  // Filter & Sort
  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesSearch =
          !searchQuery ||
          item.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.City?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.Country?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat = selectedCategory === 'All' || item.Category === selectedCategory;
        const matchesPri = selectedPriority === 'All' || item.Priority === selectedPriority;

        return matchesSearch && matchesCat && matchesPri;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const weights = { High: 3, Medium: 2, Low: 1 };
          return (weights[b.Priority] || 0) - (weights[a.Priority] || 0);
        }
        if (sortBy === 'date') {
          if (!a.PlannedVisitDate) return 1;
          if (!b.PlannedVisitDate) return -1;
          return new Date(a.PlannedVisitDate) - new Date(b.PlannedVisitDate);
        }
        if (sortBy === 'distance' && currentLocation) {
          const distA = calculateHaversineDistanceKm(
            currentLocation.latitude,
            currentLocation.longitude,
            Number(a.Latitude),
            Number(a.Longitude)
          );
          const distB = calculateHaversineDistanceKm(
            currentLocation.latitude,
            currentLocation.longitude,
            Number(b.Latitude),
            Number(b.Longitude)
          );
          return distA - distB;
        }
        return 0;
      });
  }, [items, searchQuery, selectedCategory, selectedPriority, sortBy, currentLocation]);

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading your travel wishlist..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Travel Wishlist</h2>
          <p className="text-xs text-stone-600 font-medium mt-0.5">
            Showing {filteredAndSortedItems.length} of {items.length} saved destinations
          </p>
        </div>

        {/* View Toggle on desktop */}
        <div className="hidden lg:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'split'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <IoMapOutline className="w-4 h-4" />
            Split View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'list'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <IoListOutline className="w-4 h-4" />
            List Only
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search destination, city, country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={IoSearch}
            aria-label="Search destinations"
          />

          {/* Priority filter */}
          <div>
            <label htmlFor="filter-priority" className="sr-only">Filter by Priority</label>
            <select
              id="filter-priority"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 min-h-[40px]"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  Priority: {p}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label htmlFor="filter-category" className="sr-only">Filter by Category</label>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 min-h-[40px]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort selector */}
          <div>
            <label htmlFor="filter-sort" className="sr-only">Sort Destinations</label>
            <select
              id="filter-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 min-h-[40px]"
            >
              <option value="priority">Sort: Highest Priority</option>
              <option value="date">Sort: Planned Date</option>
              <option value="distance" disabled={!currentLocation}>
                Sort: Distance from Me {!currentLocation ? '(Enable GPS)' : ''}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {filteredAndSortedItems.length === 0 ? (
        <EmptyState
          icon={IoBookmarkOutline}
          title="No destinations match your filters"
          description="Try clearing search filters or add a new place to your dream travel list."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All');
            setSelectedPriority('All');
          }}
        />
      ) : (
        <div
          className={`grid gap-6 ${
            viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
          }`}
        >
          {/* Card List */}
          <div
            className={`space-y-4 ${
              viewMode === 'split'
                ? 'lg:col-span-6 xl:col-span-5 max-h-[calc(100vh-240px)] overflow-y-auto pr-1'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0'
            }`}
          >
            {filteredAndSortedItems.map((item) => (
              <WishlistCard
                key={item.WishlistItemId || item.PlaceId}
                item={item}
                currentLocation={currentLocation}
                isSelected={selectedPlaceForMap?.WishlistItemId === item.WishlistItemId}
                onSelectOnMap={(p) => setSelectedPlaceForMap(p)}
                onMarkVisited={(p) => setVisitingPlace(p)}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>

          {/* Map View in Split Mode */}
          {viewMode === 'split' && (
            <div className="lg:col-span-6 xl:col-span-7 sticky top-20 h-[560px]">
              <LeafletMap
                markers={filteredAndSortedItems}
                selectedPlace={selectedPlaceForMap}
                onSelectPlace={(p) => setSelectedPlaceForMap(p)}
                currentLocation={currentLocation}
                className="h-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Log Visit Modal */}
      <LogVisitModal
        isOpen={Boolean(visitingPlace)}
        place={visitingPlace}
        onClose={() => setVisitingPlace(null)}
        onSuccess={() => {
          fetchWishlist();
        }}
      />
    </div>
  );
}
