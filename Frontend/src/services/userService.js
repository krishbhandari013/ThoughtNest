// client/src/services/authService.js
import axiosInstance from './axiosInstance';
import Cookies from 'js-cookie';

const userService = {
  // Register user
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/users/register', userData);
      
      const authData = response.data?.data;

      if (authData?.token) {
        // Store token in cookie (expires in 7 days)
        Cookies.set('token', authData.token, { 
          expires: 7, 
          secure: true, 
          sameSite: 'strict',
          path: '/'
        });
        
        // Store user data in localStorage (optional)
        const userData = { ...authData };
        delete userData.token;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/users/login', credentials);
      
      const authData = response.data?.data;

      if (authData?.token) {
        // Store token in cookie
        Cookies.set('token', authData.token, { 
          expires: 7, 
          secure: true, 
          sameSite: 'strict',
          path: '/'
        });
        
        // Store user data
        const userData = { ...authData };
        delete userData.token;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // Initiate Google OAuth login
  googleLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/users/google`;
  },

  // Initiate Facebook OAuth login
   facebookLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/users/facebook`;
  },

  // Initiate Facebook OAuth login in popup so main app URL does not change
  facebookLoginPopup: () => {
    const width = 520;
    const height = 680;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popupFeatures = [
      `width=${Math.floor(width)}`,
      `height=${Math.floor(height)}`,
      `left=${Math.floor(left)}`,
      `top=${Math.floor(top)}`,
      'resizable=yes',
      'scrollbars=yes',
    ].join(',');

    return window.open(
      `${import.meta.env.VITE_API_URL}/users/facebook`,
      'facebook_oauth',
      popupFeatures
    );
  },

  
  // Process Google callback (if using popup method)
  verifyGoogleToken: async (googleToken) => {
    const response = await axiosInstance.post('/api/users/google/verify', { token: googleToken });
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      await axiosInstance.post('/users/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('token', { path: '/' });
      Cookies.remove('refreshToken', { path: '/' });
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/users/me');
      return response.data?.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update profile
  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.put('/users/profile', userData);

      if (response.data?.data) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }

      return response.data?.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await axiosInstance.put('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = Cookies.get('token');
    return !!token;
  },

  // Get token
  getToken: () => {
    return Cookies.get('token');
  }
};

export default userService;