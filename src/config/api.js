// API Configuration for different environments

const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5000',
    timeout: 10000
  },
  production: {
    // For Vercel deployment, API routes are served from the same domain
    baseURL: import.meta.env.VITE_API_URL || window.location.origin,
    timeout: 15000
  }
};

const environment = import.meta.env.MODE || 'development';
const config = API_CONFIG[environment];

export const API_BASE_URL = config.baseURL;
export const API_TIMEOUT = config.timeout;

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Default headers for API requests
export const getDefaultHeaders = () => {
  const token = localStorage.getItem('groww_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  getApiUrl,
  getDefaultHeaders
};
