import { wishlistService } from '../services/wishlistService.js';
import { sendSuccess } from '../utils/response.js';

export const wishlistController = {
  async getAll(req, res, next) {
    try {
      const items = await wishlistService.getWishlist(req.query);
      return sendSuccess(res, items, 'Wishlist items retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const item = await wishlistService.getWishlistItemById(req.params.id);
      return sendSuccess(res, item, 'Wishlist item details retrieved');
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const created = await wishlistService.addToWishlist(req.body);
      return sendSuccess(res, created, 'Place added to wishlist successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await wishlistService.updateWishlistItem(req.params.id, req.body);
      return sendSuccess(res, updated, 'Wishlist item updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await wishlistService.removeWishlistItem(req.params.id);
      return sendSuccess(res, null, 'Wishlist item removed successfully');
    } catch (err) {
      next(err);
    }
  },
};
