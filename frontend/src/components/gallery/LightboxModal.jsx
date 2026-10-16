import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { photosApi } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  IoCalendarOutline,
  IoLocationOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoCheckmark,
  IoChevronBack,
  IoChevronForward,
} from 'react-icons/io5';

const BACKEND_BASE = 'http://localhost:5000';

export default function LightboxModal({
  isOpen,
  onClose,
  photo,
  onDeleteSuccess,
  onUpdateSuccess,
  onPrev = null,
  onNext = null,
  hasPrev = false,
  hasNext = false,
}) {
  const { addNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (photo) {
      setCaption(photo.Caption || '');
      setTags(photo.Tags || '');
      setIsEditing(false);
    }
  }, [photo]);

  // Keyboard navigation for Left/Right arrows
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (isEditing) return; // Don't trigger arrows while typing in input
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) {
        onPrev();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrev, hasNext, onPrev, onNext, isEditing]);

  if (!photo) return null;

  const imageUrl = photo.StorageKey.startsWith('http')
    ? photo.StorageKey
    : `${BACKEND_BASE}/uploads/${photo.StorageKey}`;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this travel photo?')) return;
    setIsDeleting(true);
    try {
      await photosApi.delete(photo.PhotoId);
      addNotification('Photo deleted successfully.', 'success');
      onDeleteSuccess?.();
      onClose();
    } catch (err) {
      addNotification(err.message || 'Failed to delete photo.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await photosApi.update(photo.PhotoId, { caption, tags });
      addNotification('Photo details updated.', 'success');
      setIsEditing(false);
      onUpdateSuccess?.();
    } catch (err) {
      addNotification(err.message || 'Failed to update photo.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const tagList = (photo.Tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={photo.PlaceName || 'Travel Photo Memoir'}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Large Image Canvas with Next/Prev Controls */}
        <div className="relative w-full max-h-[60vh] bg-stone-950 rounded-xl overflow-hidden flex items-center justify-center">
          <img
            src={imageUrl}
            alt={photo.Caption || photo.FileName}
            className="w-full h-full max-h-[60vh] object-contain select-none"
          />

          {/* Prev photo button */}
          {hasPrev && (
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition"
            >
              <IoChevronBack className="w-6 h-6" />
            </button>
          )}

          {/* Next photo button */}
          {hasNext && (
            <button
              type="button"
              onClick={onNext}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition"
            >
              <IoChevronForward className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Metadata Details Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold">
              <IoLocationOutline className="w-4 h-4 text-forest-700" aria-hidden="true" />
              <span className="text-stone-900">{photo.PlaceName}</span>
              {photo.Country && <span>({photo.Country})</span>}
            </div>
            {photo.PhotoDate && (
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mt-1">
                <IoCalendarOutline className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
                <span>Captured: {new Date(photo.PhotoDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition min-h-[34px] focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
              >
                <IoPencilOutline className="w-3.5 h-3.5" />
                Edit Details
              </button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={handleSaveEdit}
                loading={isSaving}
                icon={IoCheckmark}
              >
                Save
              </Button>
            )}

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition min-h-[34px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
            >
              <IoTrashOutline className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>

        {/* Caption & Story Area */}
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label
                htmlFor="edit-caption"
                className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1"
              >
                Caption & Story
              </label>
              <textarea
                id="edit-caption"
                rows="2"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full text-sm border rounded-lg p-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
              />
            </div>
            <div>
              <label
                htmlFor="edit-tags"
                className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1"
              >
                Tags (Comma separated)
              </label>
              <input
                id="edit-tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full text-sm border rounded-lg p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
              />
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-stone-900 leading-relaxed italic bg-stone-50 p-3 rounded-lg border-l-2 border-forest-700">
              {photo.Caption ? `"${photo.Caption}"` : 'No caption recorded for this photo.'}
            </p>
            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {tagList.map((tag) => (
                  <Badge key={tag} variant="default" size="sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
