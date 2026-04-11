// client/src/services/profileService.js
import axiosInstance from './axiosInstance';

const profileService = {
  // Get current user's profile
  getMyProfile: async () => {
    try {
      const response = await axiosInstance.get('/profile/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update profile (bio, location, website, social links)
  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put('/profile/me', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const response = await axiosInstance.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload cover image
  uploadCover: async (file) => {
    const formData = new FormData();
    formData.append('cover', file);
    
    try {
      const response = await axiosInstance.post('/profile/cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete avatar
  deleteAvatar: async () => {
    try {
      const response = await axiosInstance.delete('/profile/avatar');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete cover image
  deleteCover: async () => {
    try {
      const response = await axiosInstance.delete('/profile/cover');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get profile by user ID (for viewing other profiles)
  getProfileByUserId: async (userId) => {
    try {
      const response = await axiosInstance.get(`/profile/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default profileService;