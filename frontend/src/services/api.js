import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorResponse = error.response?.data?.error || {
      message: error.message || 'An unexpected network error occurred.',
      code: 'NETWORK_ERROR',
    };
    return Promise.reject(errorResponse);
  }
);

export const placesApi = {
  getAll: (params) => apiClient.get('/places', { params }),
  getById: (id) => apiClient.get(`/places/${id}`),
  create: (data) => apiClient.post('/places', data),
  update: (id, data) => apiClient.put(`/places/${id}`, data),
  delete: (id) => apiClient.delete(`/places/${id}`),
};

export const wishlistApi = {
  getAll: (params) => apiClient.get('/wishlist', { params }),
  create: (data) => apiClient.post('/wishlist', data),
  update: (id, data) => apiClient.patch(`/wishlist/${id}`, data),
  delete: (id) => apiClient.delete(`/wishlist/${id}`),
};

export const visitsApi = {
  getAll: (params) => apiClient.get('/visits', { params }),
  getById: (id) => apiClient.get(`/visits/${id}`),
  create: (data) => apiClient.post('/visits', data),
  update: (id, data) => apiClient.put(`/visits/${id}`, data),
  delete: (id) => apiClient.delete(`/visits/${id}`),
};

export const photosApi = {
  getAll: (params) => apiClient.get('/photos', { params }),
  upload: (formData) =>
    apiClient.post('/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => apiClient.patch(`/photos/${id}`, data),
  delete: (id) => apiClient.delete(`/photos/${id}`),
};

export const routesApi = {
  plan: (data) => apiClient.post('/routes/plan', data),
};

export const dashboardApi = {
  getSummary: () => apiClient.get('/dashboard/summary'),
};

export default apiClient;
