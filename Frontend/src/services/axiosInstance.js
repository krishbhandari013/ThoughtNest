// client/src/services/axiosInstance.js
import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: sends cookies with requests
});

// Request interceptor - Add token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from cookie
    const token = Cookies.get('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/users/login') ||
      requestUrl.includes('/users/register');
    const refreshToken = Cookies.get('refreshToken');

    // Let auth endpoints surface backend messages directly (e.g. invalid email/password).
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }
    
    // If token expired (401) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!refreshToken) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );
        
        if (response.data.token) {
          Cookies.set('token', response.data.token, { expires: 7, secure: true, sameSite: 'strict' });
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - redirect to login
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;