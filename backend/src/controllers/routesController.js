import { routePlannerService } from '../services/routePlannerService.js';
import { sendSuccess } from '../utils/response.js';

export const routesController = {
  async plan(req, res, next) {
    try {
      const { origin, destinationIds } = req.body;
      const planned = await routePlannerService.planRoute({ origin, destinationIds });
      return sendSuccess(res, planned, 'Multi-stop route calculated successfully');
    } catch (err) {
      next(err);
    }
  },
};
