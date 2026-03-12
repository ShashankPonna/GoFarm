import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const rawUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;
export const IMAGE_BASE_URL = API_URL.replace(/\/api$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API (Trust Layer OTP)
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  loginLookup: (customID) => api.post('/auth/login', { customID }),
  verifyLogin: () => api.post('/auth/verify-login'),
  getProfile: () => api.get('/auth/profile'),
};

// Exchange API (Barter Module)
export const exchangeAPI = {
  create: (data) => api.post('/exchange/create', data),
  getSent: () => api.get('/exchange/sent'),
  getReceived: () => api.get('/exchange/received'),
  accept: (exchangeID) => api.put(`/exchange/${exchangeID}/accept`),
  reject: (exchangeID) => api.put(`/exchange/${exchangeID}/reject`),
  complete: (exchangeID) => api.put(`/exchange/${exchangeID}/complete`),
  cancel: (exchangeID) => api.put(`/exchange/${exchangeID}/cancel`),
  pay: (exchangeID) => api.put(`/exchange/${exchangeID}/pay`),
};

// Disputes API
export const disputeAPI = {
  create: (formData) => api.post('/disputes/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMine: () => api.get('/disputes/mine'),
  adminGetAll: (status) => api.get('/disputes/admin/all', { params: status ? { status } : {} }),
  review: (disputeID) => api.put(`/disputes/${disputeID}/review`),
  resolve: (disputeID, data) => api.put(`/disputes/${disputeID}/resolve`, data),
  reject: (disputeID, data) => api.put(`/disputes/${disputeID}/reject`, data),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => {
    // Handle FormData for file uploads
    // Must set Content-Type to undefined so axios removes the default 'application/json'
    // and lets the browser set 'multipart/form-data' with proper boundary
    if (data instanceof FormData) {
      return api.post('/products', data, {
        headers: {
          'Content-Type': undefined
        }
      });
    }
    return api.post('/products', data);
  },
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/review`, data),
  search: (query) => api.get('/products/search', { params: { q: query } }),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
};

// Crops API
export const cropsAPI = {
  getAll: () => api.get('/crops'),
  create: (data) => api.post('/crops', data),
  update: (id, data) => api.put(`/crops/${id}`, data),
  delete: (id) => api.delete(`/crops/${id}`),
};

// Chat API
export const chatAPI = {
  getChats: () => api.get('/chat'),
  createChat: (participantId) => api.post('/chat', { participantId }),
  getChatById: (chatId) => api.get(`/chat/${chatId}`),
  sendMessage: (data) => api.post('/chat/message', data),
  sendNegotiation: (data) => api.post('/chat/negotiation', data),
  respondNegotiation: (data) => api.post('/chat/negotiation/respond', data),
  deleteChat: (chatId) => api.delete(`/chat/${chatId}`),
  getAvailableUsers: () => api.get('/users/available-for-chat'),
};

// Posts API
export const postsAPI = {
  getAll: (params) => api.get('/posts', { params }),
  create: (data) => {
    // Handle FormData for file uploads
    if (data instanceof FormData) {
      // Must set Content-Type to undefined so axios removes 'application/json' default
      return api.post('/posts', data, {
        headers: {
          'Content-Type': undefined
        }
      });
    }
    return api.post('/posts', data);
  },
  getById: (id) => api.get(`/posts/${id}`),
  update: (id, data) => {
    // Handle FormData for file uploads
    if (data instanceof FormData) {
      return api.put(`/posts/${id}`, data);
    }
    return api.put(`/posts/${id}`, data);
  },
  delete: (id) => api.delete(`/posts/${id}`),
  like: (id) => api.post(`/posts/${id}/like`),
  comment: (id, text) => api.post(`/posts/${id}/comment`, { text }),
};

// Reports API
export const reportsAPI = {
  create: (data) => api.post('/reports', data),
  getMyReports: () => api.get('/reports/my-reports'),
};

// Waste Products API
export const wasteProductsAPI = {
  getAll: (params) => api.get('/waste-products', { params }),
  getMyProducts: () => api.get('/waste-products/my-products'),
  create: (data) => api.post('/waste-products', data),
  update: (id, data) => api.put(`/waste-products/${id}`, data),
  delete: (id) => api.delete(`/waste-products/${id}`),
};

// News API
export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getOne: (id) => api.get(`/news/${id}`),
};

// Market Prices API
export const marketPricesAPI = {
  getAll: (params) => api.get('/market-prices', { params }),
  getTrending: () => api.get('/market-prices/trending'),
};

// Wishlist API
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist/add', { productId }),
  remove: (productId) => api.delete(`/wishlist/remove/${productId}`),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  update: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  remove: (productId) => api.delete(`/cart/remove/${productId}`),
  clear: () => api.delete('/cart/clear'),
};

// Farm Work / Labour Exchange API
export const farmWorkAPI = {
  create: (data) => api.post('/work/create', data),
  getNearby: () => api.get('/work/nearby'),
  apply: (postId) => api.post(`/work/apply/${postId}`),
  getMyPosts: () => api.get('/work/my-posts'),
  delete: (postId) => api.delete(`/work/${postId}`),
  close: (postId) => api.put(`/work/${postId}/close`),
};

export default api;
