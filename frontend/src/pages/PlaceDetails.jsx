import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LeafletMap from '../components/map/LeafletMap';
import LogVisitModal from '../components/places/LogVisitModal';
import { placesApi, visitsApi, photosApi } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import {
  IoLocationOutline,
  IoCalendarOutline,
  IoArrowBack,
  IoTrashOutline,
  IoImagesOutline,
  IoStar,
} from 'react-icons/io5';

const BACKEND_BASE = 'http://localhost:5000';

export default function PlaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [place, setPlace] = useState(null);
  const [visits, setVisits] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogVisitOpen, setIsLogVisitOpen] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const [placeRes, visitsRes, photosRes] = await Promise.allSettled([
        placesApi.getById(id),
        visitsApi.getAll({ placeId: id }),
        photosApi.getAll({ placeId: id }),
      ]);

      if (placeRes.status === 'fulfilled') {
        setPlace(placeRes.value.data);
      }
      if (visitsRes.status === 'fulfilled') {
        setVisits(visitsRes.value.data || []);
      }
      if (photosRes.status === 'fulfilled') {
        setPhotos(photosRes.value.data || []);
      }
    } catch (err) {
      addNotification('Failed to load place details.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handleDeletePlace = async () => {
    if (!window.confirm(`Delete "${place.Name}" and all associated history/photos?`)) return;
    try {
      await placesApi.delete(id);
      addNotification(`Deleted "${place.Name}".`, 'success');
      navigate('/wishlist');
    } catch (err) {
      addNotification(err.message || 'Failed to delete place.', 'error');
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading destination details..." />;
  }

  if (!place) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-600 font-medium">Destination not found.</p>
        <Button onClick={() => navigate(-1)} variant="secondary" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 rounded-md py-1 px-2"
        >
          <IoArrowBack className="w-4 h-4" aria-hidden="true" />
          <span>Back to Destinations</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsLogVisitOpen(true)}
            variant="primary"
            size="sm"
          >
            Log Visit
          </Button>
          <button
            type="button"
            onClick={handleDeletePlace}
            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
            title="Delete place"
            aria-label={`Delete ${place.Name}`}
          >
            <IoTrashOutline className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Details Banner */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-extrabold text-stone-900">{place.Name}</h2>
              {place.Category && <Badge variant="category">{place.Category}</Badge>}
            </div>
            <p className="text-sm text-stone-600 font-medium flex items-center gap-1.5">
              <IoLocationOutline className="w-4 h-4 text-forest-700 shrink-0" aria-hidden="true" />
              <span>
                {place.Address || `${place.City ? `${place.City}, ` : ''}${place.Country}`}
              </span>
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-stone-200 sm:pl-4">
            <span className="text-xs font-mono font-medium bg-stone-100 text-stone-700 px-2.5 py-1 rounded border border-stone-200">
              {Number(place.Latitude).toFixed(4)}°, {Number(place.Longitude).toFixed(4)}°
            </span>
          </div>
        </div>

        {place.Description && (
          <p className="text-stone-700 text-sm leading-relaxed border-t border-stone-100 pt-3">
            {place.Description}
          </p>
        )}
      </Card>

      {/* Grid: Leaflet Map & Visit History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <div className="h-[360px]">
          <LeafletMap markers={[place]} selectedPlace={place} className="h-full" showLegend={false} />
        </div>

        {/* Visits Log */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-base mb-3">
              Visit Memoirs ({visits.length})
            </h3>
            {visits.length === 0 ? (
              <p className="text-xs text-stone-500 italic leading-relaxed">
                You haven't recorded a visit to this destination yet. Click "Log Visit" to document your journey and rate your experience!
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {visits.map((v) => (
                  <div key={v.VisitId} className="p-3 bg-stone-50 rounded-lg text-xs border border-stone-200/60">
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>{new Date(v.VisitDate).toLocaleDateString()}</span>
                      {v.Rating && (
                        <div className="flex items-center text-amber-500 gap-0.5">
                          {[...Array(v.Rating)].map((_, i) => (
                            <IoStar key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      )}
                    </div>
                    {v.Notes && <p className="text-stone-700 mt-1.5 italic">"{v.Notes}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Photo Memories Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
          <IoImagesOutline className="w-5 h-5 text-forest-700" aria-hidden="true" />
          <span>Associated Photo Memories ({photos.length})</span>
        </h3>
        {photos.length === 0 ? (
          <p className="text-xs text-stone-500 italic">No photos attached to this place yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {photos.map((photo) => {
              const src = photo.StorageKey.startsWith('http')
                ? photo.StorageKey
                : `${BACKEND_BASE}/uploads/${photo.StorageKey}`;
              return (
                <div
                  key={photo.PhotoId}
                  className="aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs"
                >
                  <img
                    src={src}
                    alt={photo.Caption || photo.FileName}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Visit Modal */}
      <LogVisitModal
        isOpen={isLogVisitOpen}
        place={place}
        onClose={() => setIsLogVisitOpen(false)}
        onSuccess={() => fetchDetails()}
      />
    </div>
  );
}
