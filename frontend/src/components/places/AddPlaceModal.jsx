import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { searchPlacesGeocoding } from '../../services/geocodingService';
import { wishlistApi } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { IoSearch, IoLocationOutline, IoCalendarOutline, IoCheckmarkCircle } from 'react-icons/io5';

const CATEGORIES = ['Nature', 'Culture', 'Historic', 'Adventure', 'Culinary', 'Urban', 'Relaxation'];
const PRIORITIES = ['High', 'Medium', 'Low'];

export default function AddPlaceModal({ isOpen, onClose, onSuccess }) {
  const { addNotification } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Form Fields
  const [priority, setPriority] = useState('High');
  const [category, setCategory] = useState('Culture');
  const [plannedVisitDate, setPlannedVisitDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced geocoding search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2 || selectedPlace) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPlacesGeocoding(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Geocoding search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedPlace]);

  const handleSelectSearchResult = (result) => {
    setSelectedPlace(result);
    setSearchQuery(result.name);
    setSearchResults([]);
  };

  const handleClearSelection = () => {
    setSelectedPlace(null);
    setSearchQuery('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlace) {
      addNotification('Please search and select a verified destination from the results.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        place: {
          name: selectedPlace.name,
          address: selectedPlace.address || selectedPlace.displayName,
          city: selectedPlace.city || '',
          country: selectedPlace.country || 'Unknown',
          latitude: selectedPlace.latitude,
          longitude: selectedPlace.longitude,
          category: category,
          description: selectedPlace.displayName,
        },
        priority,
        notes,
        plannedVisitDate: plannedVisitDate || null,
      };

      await wishlistApi.create(payload);
      addNotification(`Added "${selectedPlace.name}" to your wishlist!`, 'success');
      handleClearSelection();
      setNotes('');
      setPlannedVisitDate('');
      onSuccess?.();
    } catch (err) {
      addNotification(err.message || 'Failed to add place to wishlist.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Dream Destination"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Geocoding Search Input */}
        <div className="relative">
          <Input
            label="Search Destination or Landmark"
            placeholder="e.g. Kyoto, Banff National Park, Amalfi Coast..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (selectedPlace) setSelectedPlace(null);
            }}
            icon={IoSearch}
            required
            helperText="Coordinates are fetched automatically using OpenStreetMap geocoding"
          />

          {isSearching && (
            <div className="absolute right-3 top-8 text-xs text-forest-800 font-semibold flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-forest-700 border-t-transparent rounded-full animate-spin" />
              <span>Searching...</span>
            </div>
          )}

          {/* Autocomplete Suggestion List */}
          {searchResults.length > 0 && !selectedPlace && (
            <ul
              role="listbox"
              aria-label="Geocoding suggestions"
              className="absolute z-30 mt-1 w-full bg-white rounded-xl border border-stone-300 shadow-xl max-h-56 overflow-y-auto divide-y divide-stone-100"
            >
              {searchResults.map((item) => (
                <li
                  key={item.id}
                  role="option"
                  aria-selected={false}
                  onClick={() => handleSelectSearchResult(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectSearchResult(item);
                    }
                  }}
                  tabIndex={0}
                  className="p-3 text-left hover:bg-forest-50 focus:bg-forest-50 focus:outline-none cursor-pointer transition flex items-start gap-3"
                >
                  <IoLocationOutline className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-stone-900">{item.name}</div>
                    <div className="text-xs text-stone-600 line-clamp-1">{item.displayName}</div>
                    <div className="text-[11px] font-mono text-stone-500 mt-0.5">
                      {item.latitude.toFixed(4)}°, {item.longitude.toFixed(4)}°
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected Destination Confirmation Card */}
        {selectedPlace && (
          <div className="p-3.5 bg-forest-50 border border-forest-300 rounded-xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <IoCheckmarkCircle className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-forest-950">{selectedPlace.name}</div>
                <div className="text-xs text-forest-800">
                  {selectedPlace.city ? `${selectedPlace.city}, ` : ''}{selectedPlace.country}
                </div>
                <div className="text-[11px] text-forest-700 mt-1 font-mono font-medium">
                  Verified GPS: {selectedPlace.latitude.toFixed(4)}°, {selectedPlace.longitude.toFixed(4)}°
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-xs text-forest-800 hover:text-forest-950 underline font-semibold shrink-0"
            >
              Change
            </button>
          </div>
        )}

        {/* Category & Priority Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="priority-select"
              className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5"
            >
              Priority Level
            </label>
            <select
              id="priority-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 min-h-[40px]"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="category-select"
              className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5"
            >
              Travel Category
            </label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 min-h-[40px]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Planned Visit Date */}
        <div>
          <Input
            label="Target Visit Date (Optional)"
            type="date"
            value={plannedVisitDate}
            onChange={(e) => setPlannedVisitDate(e.target.value)}
            icon={IoCalendarOutline}
            helperText="Helps sequence your itinerary by intended travel timeline"
          />
        </div>

        {/* Personal Aspirations / Notes */}
        <div>
          <label
            htmlFor="place-notes"
            className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5"
          >
            Personal Notes & Travel Wishes
          </label>
          <textarea
            id="place-notes"
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Why do you want to visit? Special viewpoints, seasons, must-see attractions..."
            className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 hover:border-stone-400"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !selectedPlace}
            loading={isSubmitting}
          >
            Add to Wishlist
          </Button>
        </div>
      </form>
    </Modal>
  );
}
