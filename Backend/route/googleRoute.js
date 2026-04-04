// server/routes/authRoutes.js
import express from 'express';
import passport from 'passport';
import generateToken from '../utils/generateToken.js';

const googleRouter = express.Router();

// Google OAuth routes
googleRouter.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

googleRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
  }),
  (req, res) => {
    // Generate JWT token
    const token = generateToken(req.user._id);
    
    // Store user data (without password)
    const userData = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role,
    };
    
    // Redirect to frontend with token in URL
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/callback?token=${token}&user=${encodeURIComponent(
        JSON.stringify(userData)
      )}`
    );
  }
);

export default googleRouter;