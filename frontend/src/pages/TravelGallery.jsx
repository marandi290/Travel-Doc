import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import PhotoUploadModal from '../components/gallery/PhotoUploadModal';
import LightboxModal from '../components/gallery/LightboxModal';
import { photosApi, placesApi } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import {
  IoImagesOutline,
  IoAdd,
  IoSearch,
  IoLocationOutline,
  IoCalendarOutline,
} from 'react-icons/io5';

const BACKEND_BASE = 'http://localhost:5000';

export default function TravelGallery() {
  const { addNotification } = useNotification();
  const [photos, setPhotos] = useState([]);
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const fetchGalleryData = async () => {
    setIsLoading(true);
    try {
      const [photoRes, placeRes] = await Promise.allSettled([
        photosApi.getAll(),
        placesApi.getAll(),
      ]);

      if (photoRes.status === 'fulfilled') {
        setPhotos(photoRes.value.data || []);
      }
      if (placeRes.status === 'fulfilled') {
        setPlaces(placeRes.value.data || []);
      }
    } catch (err) {
      addNotification(err.message || 'Failed to load photo gallery.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, []);

  // Extract all distinct tags
  const allTags = useMemo(() => {
    const set = new Set();
    photos.forEach((p) => {
      if (p.Tags) {
        p.Tags.split(',').forEach((t) => {
          const trimmed = t.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return ['All', ...Array.from(set)];
  }, [photos]);

  // Filtered Photos
  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      const matchesSearch =
        !searchQuery ||
        photo.Caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.PlaceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.Tags?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlace = selectedPlaceId === 'All' || photo.PlaceId === selectedPlaceId;

      const matchesTag =
        selectedTag === 'All' ||
        (photo.Tags &&
          photo.Tags.split(',')
            .map((t) => t.trim().toLowerCase())
            .includes(selectedTag.toLowerCase()));

      return matchesSearch && matchesPlace && matchesTag;
    });
  }, [photos, searchQuery, selectedPlaceId, selectedTag]);

  const activeLightboxPhoto =
    lightboxIndex >= 0 && lightboxIndex < filteredPhotos.length
      ? filteredPhotos[lightboxIndex]
      : null;

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading travel photo memories..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-forest-800 text-white flex items-center justify-center shadow-xs">
              <IoImagesOutline className="w-5 h-5" aria-hidden="true" />
            </span>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Travel Photo Gallery</h2>
          </div>
          <p className="text-xs text-stone-600 font-medium mt-1">
            Visual memories of places visited and bucket-list inspirations ({filteredPhotos.length} photos).
          </p>
        </div>

        <Button
          onClick={() => setIsUploadOpen(true)}
          variant="primary"
          size="sm"
          icon={IoAdd}
        >
          Upload Photo
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by caption, tags, place..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={IoSearch}
          aria-label="Search photos"
        />

        {/* Destination Filter */}
        <div>
          <label htmlFor="filter-destination" className="sr-only">Filter by Destination</label>
          <select
            id="filter-destination"
            value={selectedPlaceId}
            onChange={(e) => setSelectedPlaceId(e.target.value)}
            className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 min-h-[40px]"
          >
            <option value="All">All Destinations ({places.length})</option>
            {places.map((p) => (
              <option key={p.PlaceId} value={p.PlaceId}>
                {p.Name}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filter */}
        <div>
          <label htmlFor="filter-tag" className="sr-only">Filter by Tag</label>
          <select
            id="filter-tag"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 min-h-[40px]"
          >
            {allTags.map((t) => (
              <option key={t} value={t}>
                Tag: {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <EmptyState
          icon={IoImagesOutline}
          title="No travel photos found"
          description="Upload snapshots of your journeys or adjust your search filters."
          actionLabel="Upload First Photo"
          onAction={() => setIsUploadOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo, index) => {
            const imageUrl = photo.StorageKey.startsWith('http')
              ? photo.StorageKey
              : `${BACKEND_BASE}/uploads/${photo.StorageKey}`;

            const tags = (photo.Tags || '')
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean);

            return (
              <div
                key={photo.PhotoId}
                tabIndex={0}
                role="button"
                aria-label={`View photo of ${photo.PlaceName}: ${photo.Caption || 'Untitled'}`}
                onClick={() => setLightboxIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setLightboxIndex(index);
                  }
                }}
                className="group relative bg-white rounded-xl overflow-hidden border border-stone-200/90 shadow-xs hover:border-stone-300 hover:shadow-sm cursor-pointer transition-all duration-150 flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={photo.Caption || photo.FileName}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white text-xs font-semibold">Click to view full photo</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-3">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-forest-800 mb-1">
                    <IoLocationOutline className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{photo.PlaceName}</span>
                  </div>

                  {photo.Caption ? (
                    <p className="text-xs text-stone-800 font-medium line-clamp-2 leading-relaxed">
                      {photo.Caption}
                    </p>
                  ) : (
                    <p className="text-xs text-stone-400 italic">No caption</p>
                  )}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-stone-100 text-stone-700 font-medium px-1.5 py-0.5 rounded border border-stone-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {photo.PhotoDate && (
                    <div className="text-[10px] text-stone-500 font-medium mt-2 flex items-center gap-1">
                      <IoCalendarOutline className="w-3 h-3 text-stone-400" aria-hidden="true" />
                      <span>{new Date(photo.PhotoDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <PhotoUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          fetchGalleryData();
        }}
      />

      {/* Lightbox Modal with arrow navigation */}
      <LightboxModal
        isOpen={Boolean(activeLightboxPhoto)}
        photo={activeLightboxPhoto}
        onClose={() => setLightboxIndex(-1)}
        hasPrev={lightboxIndex > 0}
        hasNext={lightboxIndex < filteredPhotos.length - 1}
        onPrev={() => setLightboxIndex((prev) => Math.max(0, prev - 1))}
        onNext={() => setLightboxIndex((prev) => Math.min(filteredPhotos.length - 1, prev + 1))}
        onDeleteSuccess={() => {
          fetchGalleryData();
          setLightboxIndex(-1);
        }}
        onUpdateSuccess={() => {
          fetchGalleryData();
        }}
      />
    </div>
  );
}
