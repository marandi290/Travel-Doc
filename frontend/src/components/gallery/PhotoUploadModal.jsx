import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { photosApi, placesApi } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { IoCloudUploadOutline, IoClose } from 'react-icons/io5';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function PhotoUploadModal({ isOpen, onClose, onSuccess }) {
  const { addNotification } = useNotification();

  const [places, setPlaces] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      placesApi
        .getAll()
        .then((res) => {
          const list = res.data || [];
          setPlaces(list);
          if (list.length > 0 && !selectedPlaceId) {
            setSelectedPlaceId(list[0].PlaceId);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const processFile = (selected) => {
    setFileError('');
    if (!selected) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFileError('Invalid file format. Please upload a JPEG, PNG, or WebP photo.');
      return;
    }

    if (selected.size > MAX_SIZE_BYTES) {
      setFileError('File exceeds 5MB size limit. Please choose a smaller photo.');
      return;
    }

    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setFileError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setFileError('Please select a photo to upload.');
      return;
    }
    if (!selectedPlaceId) {
      addNotification('Please select a destination.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('placeId', selectedPlaceId);
      formData.append('caption', caption);
      formData.append('photoDate', photoDate);
      formData.append('tags', tags);

      await photosApi.upload(formData);
      addNotification('Travel photo uploaded successfully!', 'success');
      handleRemoveFile();
      setCaption('');
      setTags('');
      onSuccess?.();
      onClose();
    } catch (err) {
      addNotification(err.message || 'Failed to upload photo.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Travel Memory"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Destination Dropdown */}
        <div>
          <label
            htmlFor="upload-place-select"
            className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5"
          >
            Destination
          </label>
          <select
            id="upload-place-select"
            value={selectedPlaceId}
            onChange={(e) => setSelectedPlaceId(e.target.value)}
            required
            className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 min-h-[40px]"
          >
            {places.map((p) => (
              <option key={p.PlaceId} value={p.PlaceId}>
                {p.Name} ({p.Country})
              </option>
            ))}
          </select>
        </div>

        {/* Drag & Drop Photo Zone */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1.5">
            Photo File (JPEG, PNG, WebP — Max 5MB)
          </label>
          {previewUrl ? (
            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
              <img
                src={previewUrl}
                alt="Selected preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-stone-900/80 text-white hover:bg-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition"
                aria-label="Remove photo"
              >
                <IoClose className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer transition ${
                isDragging
                  ? 'border-forest-600 bg-forest-50'
                  : 'border-stone-300 hover:border-forest-700 hover:bg-forest-50/20 bg-stone-50/50'
              }`}
            >
              <IoCloudUploadOutline className="w-9 h-9 text-forest-700 mb-2" aria-hidden="true" />
              <span className="text-sm font-bold text-stone-800">
                Choose photo or drag & drop here
              </span>
              <span className="text-xs text-stone-500 mt-0.5">
                JPEG, PNG, or WebP up to 5MB
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
          {fileError && <p role="alert" className="mt-1 text-xs font-medium text-rose-600">{fileError}</p>}
        </div>

        {/* Caption */}
        <Input
          label="Caption & Story"
          placeholder="e.g. Sunset view over the mountain ridge"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {/* Photo Date */}
        <Input
          label="Date Photo Taken"
          type="date"
          value={photoDate}
          onChange={(e) => setPhotoDate(e.target.value)}
        />

        {/* Tags */}
        <Input
          label="Tags (Comma separated)"
          placeholder="e.g. sunset, nature, panoramic, memory"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
          <Button variant="secondary" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isUploading || !file}
            loading={isUploading}
          >
            Upload Photo
          </Button>
        </div>
      </form>
    </Modal>
  );
}
