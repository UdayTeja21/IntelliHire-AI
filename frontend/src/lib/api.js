import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  headers: {
    'Content-Type': 'application/json',
  },

  timeout: 30000,
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },

  (error) => Promise.reject(error)
);

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        window.location.href = '/login';
      }
    }

    console.error('API Error:', error);

    return Promise.reject(error);
  }
);

export default api;