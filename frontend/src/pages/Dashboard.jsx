import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LeafletMap from '../components/map/LeafletMap';
import { dashboardApi, wishlistApi } from '../services/api';
import {
  IoBookmarkOutline,
  IoCheckmarkCircleOutline,
  IoGlobeOutline,
  IoNavigateOutline,
  IoAdd,
  IoArrowForward,
  IoCompassOutline,
} from 'react-icons/io5';

export default function Dashboard() {
  const { currentLocation } = useOutletContext() || {};
  const [summary, setSummary] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, wishRes] = await Promise.allSettled([
        dashboardApi.getSummary(),
        wishlistApi.getAll({ status: 'Pending' }),
      ]);

      if (sumRes.status === 'fulfilled') {
        setSummary(sumRes.value.data);
      }
      if (wishRes.status === 'fulfilled') {
        setWishlistItems(wishRes.value.data || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading your travel dashboard..." />;
  }

  const totalWishlist = summary?.totalWishlistCount ?? wishlistItems.length;
  const totalVisited = summary?.totalVisitedCount ?? 0;
  const countriesCount = summary?.countriesVisitedCount ?? 0;

  return (
    <div className="space-y-6">
      {/* Traveler Hero Header */}
      <div className="rounded-2xl bg-forest-900 text-white p-6 sm:p-8 shadow-sm border border-forest-800">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800 text-forest-100 text-xs font-bold tracking-wider uppercase mb-3 border border-forest-700">
            <IoCompassOutline className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Travel Companion</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Where to next on your journey?
          </h2>
          <p className="mt-2 text-forest-100 text-sm sm:text-base leading-relaxed">
            Discover places, sequence your dream multi-stop route with the farthest-first planner, and preserve every memory.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/routes">
              <Button variant="accent" size="md" icon={IoNavigateOutline}>
                Plan Multi-Stop Route
              </Button>
            </Link>
            <Link to="/wishlist">
              <Button variant="secondary" size="md" icon={IoBookmarkOutline}>
                View Wishlist ({totalWishlist})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center shrink-0 border border-forest-100">
            <IoBookmarkOutline className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-stone-900">{totalWishlist}</div>
            <div className="text-xs text-stone-600 font-medium">Wishlist Destinations</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 border border-teal-100">
            <IoCheckmarkCircleOutline className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-stone-900">{totalVisited}</div>
            <div className="text-xs text-stone-600 font-medium">Places Visited</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center shrink-0 border border-amber-100">
            <IoGlobeOutline className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-stone-900">{countriesCount}</div>
            <div className="text-xs text-stone-600 font-medium">Countries Explored</div>
          </div>
        </Card>
      </div>

      {/* Two-Column Grid: Map Preview & Upcoming Wishlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Preview (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">Travel Map Overview</h3>
            <Link
              to="/map"
              className="text-xs font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 rounded"
            >
              <span>Explore Full Map</span>
              <IoArrowForward className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
          <LeafletMap
            markers={wishlistItems}
            currentLocation={currentLocation}
            className="h-[400px]"
            showLegend={false}
          />
        </div>

        {/* Upcoming Wishlist Destinations (1 col on lg) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">Upcoming Destinations</h3>
            <Link
              to="/wishlist"
              className="text-xs font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 rounded"
            >
              <span>View All</span>
              <IoArrowForward className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {wishlistItems.slice(0, 4).map((item) => (
              <Card
                key={item.WishlistItemId || item.PlaceId}
                className="p-3.5 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{item.Name}</h4>
                    <p className="text-xs text-stone-600 font-medium mt-0.5">
                      {item.City ? `${item.City}, ` : ''}{item.Country}
                    </p>
                  </div>
                  <Badge variant={item.Priority === 'High' ? 'high' : 'medium'} size="sm">
                    {item.Priority}
                  </Badge>
                </div>
                {item.PlannedVisitDate && (
                  <div className="text-[11px] text-amber-900 font-semibold mt-2 flex items-center gap-1">
                    <span>Target: {new Date(item.PlannedVisitDate).toLocaleDateString()}</span>
                  </div>
                )}
              </Card>
            ))}

            {wishlistItems.length === 0 && (
              <Card className="text-center py-8 text-stone-600 text-xs leading-relaxed">
                No wishlist destinations yet. Click "Add Place" in the header to pin your first dream destination!
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
