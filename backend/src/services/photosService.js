import { photosRepository } from '../repositories/photosRepository.js';
import { placesService } from './placesService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

export const photosService = {
  async getAllPhotos(filter) {
    return photosRepository.findAll(filter);
  },

  async getPhotoById(id) {
    const photo = await photosRepository.findById(id);
    if (!photo) {
      const err = new Error('Photo not found');
      err.statusCode = 404;
      err.code = 'PHOTO_NOT_FOUND';
      throw err;
    }
    return photo;
  },

  async uploadPhoto({ placeId, visitId = null, file, caption = null, photoDate = null, tags = null }) {
    await placesService.getPlaceById(placeId);

    if (!file) {
      const err = new Error('No photo file uploaded');
      err.statusCode = 400;
      err.code = 'MISSING_FILE';
      throw err;
    }

    return photosRepository.create({
      placeId,
      visitId: visitId || null,
      fileName: file.originalname,
      storageKey: file.filename,
      caption,
      photoDate,
      tags,
      fileSize: file.size,
      mimeType: file.mimetype,
    });
  },

  async updatePhoto(id, data) {
    await this.getPhotoById(id);
    return photosRepository.update(id, data);
  },

  async deletePhoto(id) {
    const photo = await this.getPhotoById(id);
    const deleted = await photosRepository.delete(id);

    // Remove file from disk
    if (photo.StorageKey) {
      const filePath = path.join(uploadsDir, photo.StorageKey);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.warn('[Photos] Failed to remove local file:', unlinkErr.message);
        }
      }
    }

    return deleted;
  },
};
