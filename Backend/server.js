// server.js
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport.js';
import connectDB from './config/mongodb.js';
import googleRoute from './route/googleRoute.js';
import userRoute from './route/userRoute.js';
import facebookRouter from './route/facebookRoute.js';
import ProfileRouter from './route/profileRoutes.js';

const app = express();

// Connect database before serving requests.
connectDB().catch((error) => {
  console.error('MongoDB connection failed:', error);
  process.exit(1);
});

// Session middleware (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// CORS
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/users', googleRoute);
app.use('/api/users', facebookRouter);
app.use('/api/users', userRoute);
app.use('/api/profile', ProfileRouter);

// Server port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});