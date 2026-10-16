import { Router } from 'express';
import placesRoutes from './placesRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import visitsRoutes from './visitsRoutes.js';
import photosRoutes from './photosRoutes.js';
import routesPlannerRoutes from './routesPlannerRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import { getDbPool } from '../config/database.js';

const apiRouter = Router();

// Health check
apiRouter.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const pool = await getDbPool();
    if (pool.connected) {
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  return res.status(200).json({
    success: true,
    status: 'healthy',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Resource Routers
apiRouter.use('/places', placesRoutes);
apiRouter.use('/wishlist', wishlistRoutes);
apiRouter.use('/visits', visitsRoutes);
apiRouter.use('/photos', photosRoutes);
apiRouter.use('/routes', routesPlannerRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

export default apiRouter;
