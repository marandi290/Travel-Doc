import { visitsService } from '../services/visitsService.js';
import { sendSuccess } from '../utils/response.js';

export const visitsController = {
  async getAll(req, res, next) {
    try {
      const visits = await visitsService.getAllVisits(req.query);
      return sendSuccess(res, visits, 'Travel history visits retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const visit = await visitsService.getVisitById(req.params.id);
      return sendSuccess(res, visit, 'Visit record retrieved');
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const created = await visitsService.recordVisit(req.body);
      return sendSuccess(res, created, 'Visit recorded successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await visitsService.updateVisit(req.params.id, req.body);
      return sendSuccess(res, updated, 'Visit updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await visitsService.deleteVisit(req.params.id);
      return sendSuccess(res, null, 'Visit deleted successfully');
    } catch (err) {
      next(err);
    }
  },
};
