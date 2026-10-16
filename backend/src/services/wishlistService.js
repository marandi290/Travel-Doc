import { wishlistRepository } from '../repositories/wishlistRepository.js';
import { placesService } from './placesService.js';

export const wishlistService = {
  async getWishlist(filter) {
    return wishlistRepository.findAll(filter);
  },

  async getWishlistItemById(id) {
    const item = await wishlistRepository.findById(id);
    if (!item) {
      const err = new Error('Wishlist item not found');
      err.statusCode = 404;
      err.code = 'WISHLIST_NOT_FOUND';
      throw err;
    }
    return item;
  },

  async addToWishlist({ placeId, place, priority = 'Medium', notes = null, plannedVisitDate = null }) {
    let resolvedPlaceId = placeId;

    if (!resolvedPlaceId && place) {
      const createdOrExistingPlace = await placesService.createPlace(place);
      resolvedPlaceId = createdOrExistingPlace.PlaceId;
    }

    if (!resolvedPlaceId) {
      const err = new Error('A valid destination or placeId is required');
      err.statusCode = 400;
      err.code = 'MISSING_PLACE';
      throw err;
    }

    // Check if place is already in active wishlist
    const existingActive = await wishlistRepository.findActiveByPlaceId(resolvedPlaceId);
    if (existingActive) {
      const err = new Error('This destination is already in your active travel wishlist');
      err.statusCode = 409;
      err.code = 'DUPLICATE_WISHLIST_ITEM';
      throw err;
    }

    return wishlistRepository.create({
      placeId: resolvedPlaceId,
      priority,
      notes,
      plannedVisitDate,
      status: 'Pending',
    });
  },

  async updateWishlistItem(id, data) {
    await this.getWishlistItemById(id);
    return wishlistRepository.update(id, data);
  },

  async removeWishlistItem(id) {
    await this.getWishlistItemById(id);
    return wishlistRepository.delete(id);
  },
};
