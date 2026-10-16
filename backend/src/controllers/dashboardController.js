import { wishlistRepository } from '../repositories/wishlistRepository.js';
import { visitsRepository } from '../repositories/visitsRepository.js';
import { photosRepository } from '../repositories/photosRepository.js';
import { sendSuccess } from '../utils/response.js';

export const dashboardController = {
  async getSummary(req, res, next) {
    try {
      const [pendingWishlist, allVisits, recentPhotos, uniqueCountries] = await Promise.all([
        wishlistRepository.findAll({ status: 'Pending' }),
        visitsRepository.findAll(),
        photosRepository.findAll(),
        visitsRepository.countUniqueCountries(),
      ]);

      const summary = {
        totalWishlistCount: pendingWishlist.length,
        totalVisitedCount: allVisits.length,
        countriesVisitedCount: uniqueCountries,
        upcomingDestinations: pendingWishlist.slice(0, 5),
        recentVisits: allVisits.slice(0, 5),
        recentPhotos: recentPhotos.slice(0, 6),
      };

      return sendSuccess(res, summary, 'Dashboard summary retrieved successfully');
    } catch (err) {
      next(err);
    }
  },
};
