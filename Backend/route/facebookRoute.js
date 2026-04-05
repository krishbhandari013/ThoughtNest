import express from 'express';
import passport from 'passport';
import generateToken from '../utils/generateToken.js';


const facebookRouter = express.Router();

facebookRouter.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['public_profile'] })
);

facebookRouter.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/callback?error=facebook_auth_failed`,
  }),
  (req, res) => {
    try {
      console.log('Facebook auth successful for user:', req.user?.email);
      
      // Generate JWT token
      const token = generateToken(req.user._id);
      
      // Store user data
      const userData = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        role: req.user.role,
      };
      
      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectUrl = `${frontendUrl}/callback?token=${token}&user=${encodeURIComponent(
        JSON.stringify(userData)
      )}`;
      
    //   console.log('Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Facebook callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const message = encodeURIComponent(error?.message || 'Authentication failed');
      res.redirect(`${frontendUrl}/callback?error=auth_failed&message=${message}`);
    }
  }
);

export default facebookRouter;
