// server/routes/profileRoutes.js
import express from 'express';
import {
  getOrCreateProfile,
  updateProfile,
  uploadAvatar,
  uploadCover,
  deleteAvatar,
  deleteCover,
  getProfileByUserId,
} from '../controllers/profileController.js';
import { protect } from '../middleware/userMiddleware.js';
import { uploadAvatar as uploadAvatarMiddleware, uploadCover as uploadCoverMiddleware } from '../middleware/uploadMiddleware.js';
import { validate, updateProfileSchema } from '../validators/profileValidator.js';

const ProfileRouter = express.Router();

// All routes are protected (require authentication)
ProfileRouter.use(protect);

// Get or create profile for logged-in user
ProfileRouter.get('/me', getOrCreateProfile);

// Update profile details
ProfileRouter.put('/me', validate(updateProfileSchema), updateProfile);

// Avatar upload and delete
ProfileRouter.post('/avatar', uploadAvatarMiddleware, uploadAvatar);
ProfileRouter.delete('/avatar', deleteAvatar);

// Cover image upload and delete
ProfileRouter.post('/cover', uploadCoverMiddleware, uploadCover);
ProfileRouter.delete('/cover', deleteCover);

// Get profile by user ID (public - but still protected for now)
ProfileRouter.get('/user/:userId', getProfileByUserId);

export default ProfileRouter;