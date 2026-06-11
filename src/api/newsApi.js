import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export const newsApi = {
  // Get news with filters
  getNews: (params) => api.get('/news', { params }),
  
  // Get breaking news
  getBreakingNews: () => api.get('/news/breaking'),
  
  // Get trending stocks
  getTrendingStocks: () => api.get('/stocks/trending'),
  
  // Search articles
  searchArticles: (query) => api.get('/search', { params: { q: query } }),
  
  // Get available filters
  getFilters: () => api.get('/filters'),
  
  // Favorites management
  getFavorites: (userId) => api.get(`/favorites/${userId}`),
  addFavorite: (userId, ticker) => api.post('/favorites', { userId, ticker }),
  removeFavorite: (userId, ticker) => api.delete(`/favorites/${userId}/${ticker}`),
};

export default api;