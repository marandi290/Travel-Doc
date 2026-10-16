import { visitsRepository } from '../repositories/visitsRepository.js';
import { wishlistRepository } from '../repositories/wishlistRepository.js';
import { placesService } from './placesService.js';

export const visitsService = {
  async getAllVisits(filter) {
    return visitsRepository.findAll(filter);
  },

  async getVisitById(id) {
    const visit = await visitsRepository.findById(id);
    if (!visit) {
      const err = new Error('Visit record not found');
      err.statusCode = 404;
      err.code = 'VISIT_NOT_FOUND';
      throw err;
    }
    return visit;
  },

  async recordVisit({ placeId, visitDate, rating = null, notes = null, markWishlistVisited = true }) {
    await placesService.getPlaceById(placeId);

    const visit = await visitsRepository.create({
      placeId,
      visitDate,
      rating,
      notes,
    });

    if (markWishlistVisited) {
      await wishlistRepository.markVisitedByPlaceId(placeId);
    }

    return visit;
  },

  async updateVisit(id, data) {
    await this.getVisitById(id);
    return visitsRepository.update(id, data);
  },

  async deleteVisit(id) {
    await this.getVisitById(id);
    return visitsRepository.delete(id);
  },
};
