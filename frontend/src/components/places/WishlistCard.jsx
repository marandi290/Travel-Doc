import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import {
  IoCalendarOutline,
  IoLocationOutline,
  IoCheckmarkCircleOutline,
  IoTrashOutline,
  IoNavigateOutline,
} from 'react-icons/io5';
import { calculateHaversineDistanceKm } from '../../utils/haversine';

export default function WishlistCard({
  item,
  currentLocation = null,
  onSelectOnMap = null,
  onMarkVisited = null,
  onDelete = null,
  isSelected = false,
}) {
  const priorityVariant =
    item.Priority === 'High' ? 'high' : item.Priority === 'Medium' ? 'medium' : 'low';

  // Calculate straight-line distance if GPS coordinates exist
  let distanceKm = null;
  if (currentLocation?.latitude && currentLocation?.longitude && item.Latitude && item.Longitude) {
    distanceKm = calculateHaversineDistanceKm(
      currentLocation.latitude,
      currentLocation.longitude,
      Number(item.Latitude),
      Number(item.Longitude)
    );
  }

  return (
    <Card
      className={`relative flex flex-col justify-between transition-all ${
        isSelected
          ? 'ring-2 ring-forest-700 bg-forest-50/20 border-forest-600'
          : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant={priorityVariant} size="sm">
            {item.Priority} Priority
          </Badge>
          {item.Category && (
            <Badge variant="category" size="sm">
              {item.Category}
            </Badge>
          )}
        </div>

        {/* Place Title & Location */}
        <h3 className="font-bold text-stone-900 text-lg leading-snug">
          {item.Name}
        </h3>
        <p className="text-xs text-stone-600 font-medium flex items-center gap-1.5 mt-1">
          <IoLocationOutline className="w-4 h-4 shrink-0 text-stone-400" aria-hidden="true" />
          <span>
            {item.City ? `${item.City}, ` : ''}{item.Country}
          </span>
        </p>

        {/* Coordinates & Live Distance Info */}
        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-stone-600">
          <span className="font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[11px] font-medium border border-stone-200">
            {Number(item.Latitude).toFixed(2)}°, {Number(item.Longitude).toFixed(2)}°
          </span>
          {distanceKm !== null && (
            <span className="text-forest-800 font-bold flex items-center gap-1 bg-forest-50 px-2 py-0.5 rounded border border-forest-200 text-[11px]">
              <IoNavigateOutline className="w-3.5 h-3.5 text-forest-700" aria-hidden="true" />
              {distanceKm} km away
            </span>
          )}
        </div>

        {/* Planned Visit Date */}
        {item.PlannedVisitDate && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-950 font-semibold bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 w-fit">
            <IoCalendarOutline className="w-3.5 h-3.5 text-amber-800" aria-hidden="true" />
            <span>Target: {new Date(item.PlannedVisitDate).toLocaleDateString()}</span>
          </div>
        )}

        {/* Traveler Notes / Aspirations */}
        {item.Notes && (
          <p className="text-xs text-stone-700 italic bg-stone-50 p-2.5 rounded-lg mt-3 border-l-2 border-forest-700 leading-relaxed line-clamp-3">
            "{item.Notes}"
          </p>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-stone-100">
        <button
          type="button"
          onClick={() => onSelectOnMap?.(item)}
          className="text-xs font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 rounded-md py-1 px-1.5 -ml-1.5"
        >
          <IoNavigateOutline className="w-4 h-4 text-forest-700" aria-hidden="true" />
          <span>Focus Map</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onMarkVisited?.(item)}
            className="min-h-[34px] px-3 py-1.5 rounded-lg text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-300 transition-colors text-xs font-bold flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            aria-label={`Log visit to ${item.Name}`}
          >
            <IoCheckmarkCircleOutline className="w-4 h-4 text-teal-700" aria-hidden="true" />
            <span>Mark Visited</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(item)}
            className="min-h-[34px] p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
            aria-label={`Remove ${item.Name} from wishlist`}
            title="Remove destination"
          >
            <IoTrashOutline className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Card>
  );
}
