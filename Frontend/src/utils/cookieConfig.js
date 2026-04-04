// client/src/utils/cookieConfig.js
import Cookies from 'js-cookie';

// Cookie options
export const cookieOptions = {
  expires: 7,           // Days until expiration
  secure: true,        // Only send over HTTPS
  sameSite: 'strict',  // Prevent CSRF
  path: '/'            // Available across entire site
};

// Set cookie with options
export const setAuthCookie = (token) => {
  Cookies.set('token', token, cookieOptions);
};

// Get cookie
export const getAuthCookie = () => {
  return Cookies.get('token');
};

// Remove cookie
export const removeAuthCookie = () => {
  Cookies.remove('token', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });
};