import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import LeafletMap from '../components/map/LeafletMap';
import { visitsApi } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import {
  IoTimeOutline,
  IoStar,
  IoCalendarOutline,
  IoLocationOutline,
  IoSearch,
  IoMapOutline,
  IoListOutline,
  IoTrashOutline,
} from 'react-icons/io5';

export default function TravelHistory() {
  const { addNotification } = useNotification();
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [viewMode, setViewMode] = useState('timeline');

  const fetchVisits = async () => {
    setIsLoading(true);
    try {
      const res = await visitsApi.getAll();
      setVisits(res.data || []);
    } catch (err) {
      addNotification(err.message || 'Failed to load travel history.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleDeleteVisit = async (visitId, placeName) => {
    if (!window.confirm(`Delete visit memoir record for "${placeName}"?`)) return;
    try {
      await visitsApi.delete(visitId);
      addNotification('Visit record deleted.', 'success');
      setVisits((prev) => prev.filter((v) => v.VisitId !== visitId));
    } catch (err) {
      addNotification(err.message || 'Failed to delete visit.', 'error');
    }
  };

  // Distinct countries for filter
  const countries = useMemo(() => {
    const list = ['All', ...new Set(visits.map((v) => v.Country).filter(Boolean))];
    return list;
  }, [visits]);

  // Filtered & Chronologically Sorted
  const filteredVisits = useMemo(() => {
    return visits
      .filter((v) => {
        const matchesSearch =
          !searchQuery ||
          v.PlaceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.City?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.Country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.Notes?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCountry = selectedCountry === 'All' || v.Country === selectedCountry;
        return matchesSearch && matchesCountry;
      })
      .sort((a, b) => new Date(b.VisitDate) - new Date(a.VisitDate));
  }, [visits, searchQuery, selectedCountry]);

  // Map markers from visits
  const mapMarkers = useMemo(() => {
    return filteredVisits.map((v) => ({
      ...v,
      Name: v.PlaceName || v.Name,
      isVisited: true,
    }));
  }, [filteredVisits]);

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading your travel history..." />;
  }

  const uniqueCountriesCount = new Set(visits.map((v) => v.Country).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Header & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center shadow-xs">
              <IoTimeOutline className="w-5 h-5" aria-hidden="true" />
            </span>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Travel Memoirs & History</h2>
          </div>
          <p className="text-xs text-stone-600 font-medium mt-1">
            A chronological timeline of places visited, personal ratings, and memoirs.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'timeline'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <IoListOutline className="w-4 h-4" />
            Timeline
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'map'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <IoMapOutline className="w-4 h-4" />
            Map View
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">Total Visits</div>
          <div className="text-2xl font-extrabold text-teal-800 mt-1">{visits.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">Countries Explored</div>
          <div className="text-2xl font-extrabold text-stone-900 mt-1">{uniqueCountriesCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">Average Rating</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">
            {visits.length > 0
              ? (
                  visits.reduce((acc, v) => acc + (v.Rating || 0), 0) /
                  (visits.filter((v) => v.Rating).length || 1)
                ).toFixed(1)
              : 'N/A'}{' '}
            ★
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">Latest Visit</div>
          <div className="text-sm font-bold text-stone-800 mt-2 truncate">
            {visits[0]?.PlaceName || 'None recorded yet'}
          </div>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search memoirs, cities, countries, places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={IoSearch}
            aria-label="Search travel memoirs"
          />
        </div>
        <div className="w-full sm:w-56">
          <label htmlFor="country-filter" className="sr-only">Filter by Country</label>
          <select
            id="country-filter"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 min-h-[40px]"
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                Country: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View Mode Switching */}
      {viewMode === 'map' ? (
        <div className="h-[600px]">
          <LeafletMap markers={mapMarkers} className="h-full" showLegend={true} />
        </div>
      ) : (
        /* Timeline View */
        <div className="space-y-4">
          {filteredVisits.length === 0 ? (
            <EmptyState
              icon={IoTimeOutline}
              title="No visit memoirs found"
              description="Mark destinations on your wishlist as visited to build your personal travel memoir timeline."
            />
          ) : (
            <div className="relative border-l-2 border-teal-300 ml-4 sm:ml-6 pl-4 sm:pl-6 space-y-6">
              {filteredVisits.map((visit) => (
                <div key={visit.VisitId} className="relative group">
                  {/* Timeline marker node */}
                  <div className="absolute -left-[27px] sm:-left-[35px] top-2 w-5 h-5 rounded-full bg-teal-700 border-4 border-white shadow-xs flex items-center justify-center" aria-hidden="true" />

                  <Card className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-stone-900 text-lg leading-snug">
                            {visit.PlaceName}
                          </h3>
                          <Badge variant="visited" size="sm">
                            Visited
                          </Badge>
                        </div>
                        <div className="text-xs text-stone-600 font-medium flex items-center gap-1.5 mt-1">
                          <IoLocationOutline className="w-4 h-4 text-stone-400" aria-hidden="true" />
                          <span>
                            {visit.City ? `${visit.City}, ` : ''}{visit.Country}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Rating Stars */}
                        {visit.Rating && (
                          <div
                            className="flex items-center text-amber-500"
                            aria-label={`Rated ${visit.Rating} of 5 stars`}
                          >
                            {[...Array(visit.Rating)].map((_, i) => (
                              <IoStar key={i} className="w-4 h-4 fill-amber-400" aria-hidden="true" />
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-stone-700 font-semibold bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                          <IoCalendarOutline className="w-3.5 h-3.5 text-stone-500" aria-hidden="true" />
                          <span>{new Date(visit.VisitDate).toLocaleDateString()}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteVisit(visit.VisitId, visit.PlaceName)}
                          title="Delete visit record"
                          aria-label={`Delete visit record for ${visit.PlaceName}`}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 transition"
                        >
                          <IoTrashOutline className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Visit Memoir Notes */}
                    {visit.Notes ? (
                      <p className="mt-3 text-stone-800 text-sm leading-relaxed italic bg-stone-50 p-3 rounded-lg border-l-2 border-teal-700">
                        "{visit.Notes}"
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-stone-500 italic">No notes recorded for this visit.</p>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
