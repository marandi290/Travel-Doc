import { placesRepository } from '../repositories/placesRepository.js';

export const placesService = {
  async getAllPlaces(filter) {
    return placesRepository.findAll(filter);
  },

  async getPlaceById(id) {
    const place = await placesRepository.findById(id);
    if (!place) {
      const err = new Error('Destination not found');
      err.statusCode = 404;
      err.code = 'PLACE_NOT_FOUND';
      throw err;
    }
    return place;
  },

  async createPlace(data) {
    // Check if place already exists near coordinates or name
    const existing = await placesRepository.findByCoordinatesOrName(
      data.name,
      data.latitude,
      data.longitude
    );
    if (existing) {
      return existing;
    }
    return placesRepository.create(data);
  },

  async updatePlace(id, data) {
    await this.getPlaceById(id);
    return placesRepository.update(id, data);
  },

  async deletePlace(id) {
    await this.getPlaceById(id);
    return placesRepository.delete(id);
  },
};
