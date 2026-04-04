// client/src/context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import userService from '../services/userService';

const userContext = createContext();

export const useUser = () => {
  const context = useContext(userContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = Cookies.get('token');
    console.log('🔍 Checking auth, token exists:', !!token);
    
    if (token) {
      try {
        const currentUser = await userService.getCurrentUser();
        console.log('✅ Auth check successful:', currentUser);
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        Cookies.remove('token', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const register = async (userData) => {
    try {
      console.log('📝 Registering user:', userData.email);
      const response = await userService.register(userData);
      console.log('📝 Register response:', response);
      
      const authData = response.data;
      const { token, ...userDataResponse } = authData.data;
      
      // Save token in cookie
      Cookies.set('token', token, { 
        expires: 7,
        secure: false,
        sameSite: 'lax',
        path: '/'
      });
      
      console.log('✅ Token saved in cookie');
      
      setUser(userDataResponse);
      setIsAuthenticated(true);
      
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 Logging in user:', credentials.email);
      const response = await userService.login(credentials);
      console.log('🔐 Login response:', response);
      
      const authData = response.data;
      const { token, ...userDataResponse } = authData.data;
      
      // Save token in cookie
      Cookies.set('token', token, { 
        expires: 7,
        secure: false,
        sameSite: 'lax',
        path: '/'
      });
      
      console.log('✅ Token saved in cookie');
      
      setUser(userDataResponse);
      setIsAuthenticated(true);
      
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user');
      await userService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Remove cookies
      Cookies.remove('token', { path: '/' });
      Cookies.remove('refreshToken', { path: '/' });
      console.log('✅ Cookies removed');
      
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      console.log('📝 Updating profile for user:', userData.name);
      const response = await userService.updateProfile(userData);
      console.log('📝 Update response:', response);
      
      setUser(response.data);
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Update profile error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Update failed' 
      };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await userService.changePassword(passwordData);
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password change failed' 
      };
    }
  };

  // Helper functions
  const isLoggedIn = () => {
    const token = Cookies.get('token');
    return !!token && !!user;
  };

  const getToken = () => {
    return Cookies.get('token');
  };

  return (
    <userContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      register,
      login,
      logout,
      updateProfile,
      changePassword,
      checkAuth,
      isLoggedIn,
      getToken
    }}>
      {children}
    </userContext.Provider>
  );
};