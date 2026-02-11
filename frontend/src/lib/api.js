import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://trouvetontrail.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Races API
export const racesAPI = {
  getAll: (params) => api.get('/races', { params }),
  getById: (id) => api.get(`/races/${id}`),
  create: (data) => api.post('/races', data),
  update: (id, data) => api.put(`/races/${id}`, data),
  delete: (id) => api.delete(`/races/${id}`),
};

// Favorites API
export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (raceId, notify = true) => api.post(`/favorites/${raceId}?notify=${notify}`),
  remove: (raceId) => api.delete(`/favorites/${raceId}`),
  toggleNotify: (raceId, notify) => api.put(`/favorites/${raceId}/notify?notify=${notify}`),
};

// Admin API
export const adminAPI = {
  getPending: () => api.get('/admin/pending'),
  moderate: (raceId, action, reason) => api.post(`/admin/moderate/${raceId}`, { action, reason }),
};

// Filters API
export const filtersAPI = {
  getRegions: () => api.get('/filters/regions'),
  getDepartments: (region) => api.get('/filters/departments', { params: { region } }),
};

// Seed API
export const seedAPI = {
  seed: () => api.post('/seed'),
};

// User API
export const userAPI = {
  updateSettings: (emailNotifications) => api.put(`/users/settings?email_notifications=${emailNotifications}`),
};

export default api;
