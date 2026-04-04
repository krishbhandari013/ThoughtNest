// server/config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Google Strategy (existing)
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }
        
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos?.[0]?.value || '',
          isVerified: true,
        });
        
        return done(null, user);
      } catch (error) {
        console.error('Google Strategy Error:', error);
        return done(error, null);
      }
    }
  )
);

// ✅ Facebook Strategy (new)
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'displayName', 'photos', 'email'], // Request specific fields
      enableProof: true, // Adds appsecret_proof for security
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const fallbackEmail = `${profile.id}@facebook.local`;
        const resolvedEmail = email || fallbackEmail;
        console.log('Facebook profile received:', email || '(no email)');
        
        // Prefer linking by facebookId first, then by email if available.
        let user = await User.findOne({ facebookId: profile.id });

        if (!user && email) {
          user = await User.findOne({ email });
        }
        
        if (user) {
          // Update existing user with Facebook ID if not already set
          if (!user.facebookId) {
            user.facebookId = profile.id;
            await user.save();
          }
          return done(null, user);
        }
        
        // Create new user - no password needed for Facebook auth
        user = await User.create({
          name: profile.displayName,
          email: resolvedEmail,
          facebookId: profile.id,
          avatar: profile.photos?.[0]?.value || '',
          isVerified: true,
        });
        
        console.log('✅ New Facebook user created:', user.email);
        return done(null, user);
      } catch (error) {
        console.error('Facebook Strategy Error:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize/Deserialize (same as before)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;