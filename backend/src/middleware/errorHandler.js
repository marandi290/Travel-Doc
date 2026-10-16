import { sendError } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  // Zod / validation error
  if (err.name === 'ZodError') {
    return sendError(
      res,
      'Validation failed for input data',
      400,
      'VALIDATION_ERROR',
      err.errors
    );
  }

  // Multer error
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'File size limit exceeded (Max 5MB)', 400, 'FILE_TOO_LARGE');
    }
    return sendError(res, err.message, 400, 'UPLOAD_ERROR');
  }

  // Custom client error with status
  if (err.statusCode && err.statusCode < 500) {
    return sendError(res, err.message, err.statusCode, err.code || 'CLIENT_ERROR');
  }

  // Database unique constraint violation (e.g., duplicate active wishlist item)
  if (err.number === 2601 || err.number === 2627) {
    return sendError(
      res,
      'This destination is already in your active travel wishlist.',
      409,
      'DUPLICATE_ENTRY'
    );
  }

  // Generic internal server error (never leak raw stack trace or credentials)
  return sendError(
    res,
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal Server Error',
    500,
    'SERVER_ERROR'
  );
}

export function notFoundHandler(req, res) {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404, 'NOT_FOUND');
}
