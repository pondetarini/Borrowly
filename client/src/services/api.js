import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('borrowly_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// API Service Modules
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData)
};

export const itemAPI = {
  getAll: (params) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/${id}`),
  create: (itemData) => api.post('/items', itemData),
  update: (id, itemData) => api.put(`/items/${id}`, itemData),
  delete: (id) => api.delete(`/items/${id}`),
  getCategories: () => api.get('/items/categories')
};

export const requestAPI = {
  create: (requestData) => api.post('/requests', requestData),
  getMyRequests: () => api.get('/requests/my'),
  getIncomingRequests: () => api.get('/requests/incoming'),
  updateStatus: (id, status, note) => api.put(`/requests/${id}/status`, { status, note }),
  cancel: (id) => api.put(`/requests/${id}/cancel`)
};

export const transactionAPI = {
  getMyTransactions: (role) => api.get('/transactions', { params: { role } }),
  getById: (id) => api.get(`/transactions/${id}`),
  initiateReturn: (id) => api.put(`/transactions/${id}/return-request`),
  confirmReturn: (id) => api.put(`/transactions/${id}/confirm-return`)
};

export const reviewAPI = {
  create: (reviewData) => api.post('/reviews', reviewData),
  getByItem: (itemId) => api.get(`/reviews/item/${itemId}`)
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all')
};

export const reportAPI = {
  create: (reportData) => api.post('/reports', reportData),
  getAll: () => api.get('/reports'),
  update: (id, reportData) => api.put(`/reports/${id}`, reportData)
};

export const aiAPI = {
  search: (query) => api.post('/ai/search', { query }),
  getRecommendations: () => api.get('/ai/recommendations')
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getRiskFlags: () => api.get('/admin/risk-flags'),
  updateRiskFlag: (id, flagData) => api.put(`/admin/risk-flags/${id}`, flagData),
  runRiskScan: () => api.post('/admin/run-risk-analysis')
};

export default api;
