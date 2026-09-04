import axios from 'axios';

// Calculate the base URL dynamically from environment variables
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:5000/api';
  const clean = envUrl.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('weddingai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalise error messages; auto-logout on 401 so stale tokens don't silently fail
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    if (status === 401) {
      localStorage.removeItem('weddingai_token');
      // Only redirect if not already on an auth page to avoid redirect loops
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register')
      ) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(message);
  }
);

export default api;
