import { photosService } from '../services/photosService.js';
import { sendSuccess } from '../utils/response.js';

export const photosController = {
  async getAll(req, res, next) {
    try {
      const photos = await photosService.getAllPhotos(req.query);
      return sendSuccess(res, photos, 'Photo memories retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const photo = await photosService.getPhotoById(req.params.id);
      return sendSuccess(res, photo, 'Photo details retrieved');
    } catch (err) {
      next(err);
    }
  },

  async upload(req, res, next) {
    try {
      const { placeId, visitId, caption, photoDate, tags } = req.body;
      const uploaded = await photosService.uploadPhoto({
        placeId,
        visitId,
        file: req.file,
        caption,
        photoDate,
        tags,
      });
      return sendSuccess(res, uploaded, 'Photo uploaded successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await photosService.updatePhoto(req.params.id, req.body);
      return sendSuccess(res, updated, 'Photo updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await photosService.deletePhoto(req.params.id);
      return sendSuccess(res, null, 'Photo deleted successfully');
    } catch (err) {
      next(err);
    }
  },
};
