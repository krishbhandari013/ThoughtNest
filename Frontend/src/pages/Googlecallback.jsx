// client/src/pages/GoogleCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const GoogleCallback = () => {
  console.log('GoogleCallback component mounted');
  const navigate = useNavigate();
  const location = useLocation();

  const notifyOpenerAndClose = (payload) => {
    if (!window.opener || window.opener.closed) {
      return false;
    }

    let targetOrigin = '*';
    try {
      targetOrigin = window.opener.location.origin || '*';
    } catch {
      // Cross-origin access can throw; fallback to wildcard for postMessage.
      targetOrigin = '*';
    }

    window.opener.postMessage(payload, targetOrigin);
    window.close();
    return true;
  };

  useEffect(() => {
    // Parse the URL parameters
    const params = new URLSearchParams(location.search);
    const authError = params.get('error');
    const backendMessage = params.get('message') || params.get('error_description');
    const token = params.get('token');
    const userParam = params.get('user');

    if (authError) {
      const decodedMessage = (() => {
        if (!backendMessage) {
          if (authError === 'facebook_auth_failed') return 'Facebook login failed. Check app setup and try again.';
          if (authError === 'google_auth_failed') return 'Google login failed. Please try again.';
          if (authError === 'auth_failed') return 'Authentication failed. Please try again.';
          return authError;
        }

        try {
          return decodeURIComponent(backendMessage);
        } catch {
          return backendMessage;
        }
      })();

      if (notifyOpenerAndClose({ type: 'oauth-error', message: decodedMessage })) {
        return;
      }

      const safeMessage = encodeURIComponent(decodedMessage);
      navigate(`/login?error=${encodeURIComponent(authError)}&message=${safeMessage}`);
      return;
    }
    
    if (token && userParam) {
      try {
        const user = JSON.parse(userParam);
        
        // Save token to cookie
        Cookies.set('token', token, {
          expires: 7,
          secure: false,
          sameSite: 'lax',
          path: '/',
        });
        
        // Save user data to localStorage (optional)
        localStorage.setItem('user', JSON.stringify(user));

        // If OAuth was opened in a popup, notify opener and close popup.
        if (notifyOpenerAndClose({ type: 'oauth-success', user })) {
          return;
        }
        
        // Redirect to home page
        navigate('/');
      } catch (error) {
        console.error('Error parsing user data:', error);
        if (notifyOpenerAndClose({ type: 'oauth-error', message: 'Invalid OAuth response.' })) {
          return;
        }
        navigate('/login?error=invalid_oauth_response&message=Invalid%20OAuth%20response.');
      }
    } else {
      const missingParamsMessage = 'Missing OAuth parameters.';
      if (notifyOpenerAndClose({ type: 'oauth-error', message: missingParamsMessage })) {
        return;
      }
      navigate('/login?error=missing_oauth_parameters&message=Missing%20OAuth%20parameters.');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google sign in...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;