import { placesService } from '../services/placesService.js';
import { sendSuccess } from '../utils/response.js';

export const placesController = {
  async getAll(req, res, next) {
    try {
      const places = await placesService.getAllPlaces(req.query);
      return sendSuccess(res, places, 'Destinations retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const place = await placesService.getPlaceById(req.params.id);
      return sendSuccess(res, place, 'Destination details retrieved');
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const created = await placesService.createPlace(req.body);
      return sendSuccess(res, created, 'Destination created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await placesService.updatePlace(req.params.id, req.body);
      return sendSuccess(res, updated, 'Destination updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await placesService.deletePlace(req.params.id);
      return sendSuccess(res, null, 'Destination deleted successfully');
    } catch (err) {
      next(err);
    }
  },
};
