import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // Increased timeout to 120 seconds
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

// Handle unauthorized responses and timeouts gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle timeout error
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('[API Timeout]: The request took too long to complete.');
      // Return a standard structured error instead of crashing
      return Promise.reject({
        response: {
          status: 408,
          data: { detail: 'Request timed out (exceeded 120s). The AI might be under heavy load. Please try again.' }
        }
      });
    }

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;