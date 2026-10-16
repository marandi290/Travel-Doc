import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { visitsApi } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { IoStar, IoStarOutline, IoCalendarOutline, IoCheckmarkCircle } from 'react-icons/io5';

export default function LogVisitModal({ isOpen, onClose, place, onSuccess }) {
  const { addNotification } = useNotification();

  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [markWishlistVisited, setMarkWishlistVisited] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!place) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await visitsApi.create({
        placeId: place.PlaceId,
        visitDate,
        rating,
        notes,
        markWishlistVisited,
      });

      addNotification(`Logged visit to "${place.Name}"!`, 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      addNotification(err.message || 'Failed to record visit.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Journey Memoir"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Destination Header Pill */}
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
          <div className="text-[11px] text-teal-800 font-bold uppercase tracking-wider">
            Visited Destination
          </div>
          <div className="text-base font-bold text-teal-950 mt-0.5">{place.Name}</div>
          <div className="text-xs text-teal-800">
            {place.City ? `${place.City}, ` : ''}{place.Country}
          </div>
        </div>

        {/* Visit Date */}
        <div>
          <Input
            label="Date of Visit"
            type="date"
            required
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            icon={IoCalendarOutline}
          />
        </div>

        {/* 1-5 Star Rating Selector */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
            Experience Rating
          </label>
          <div className="flex items-center gap-1.5" role="group" aria-label="Experience Rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} out of 5 stars`}
                className="p-1 rounded-md text-amber-500 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-transform"
              >
                {star <= rating ? (
                  <IoStar className="w-7 h-7 fill-amber-400 text-amber-400" aria-hidden="true" />
                ) : (
                  <IoStarOutline className="w-7 h-7 text-stone-300" aria-hidden="true" />
                )}
              </button>
            ))}
            <span className="text-xs font-bold text-stone-800 ml-2">
              {rating} / 5 Stars
            </span>
          </div>
        </div>

        {/* Travel Memoirs & Highlights */}
        <div>
          <label
            htmlFor="visit-notes"
            className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5"
          >
            Memoirs & Highlights
          </label>
          <textarea
            id="visit-notes"
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What made this trip memorable? Sights, food, recommendations for next time..."
            className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 hover:border-stone-400"
          />
        </div>

        {/* Mark Wishlist Item as Visited Checkbox */}
        <label className="flex items-center gap-2.5 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={markWishlistVisited}
            onChange={(e) => setMarkWishlistVisited(e.target.checked)}
            className="w-4 h-4 rounded text-teal-700 focus:ring-teal-600 border-stone-300"
          />
          <span className="text-xs text-stone-800 font-medium select-none">
            Mark associated wishlist item as visited
          </span>
        </label>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Save Memoir Log
          </Button>
        </div>
      </form>
    </Modal>
  );
}
