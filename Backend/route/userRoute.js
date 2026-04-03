import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,

} from '../controllers/userControllers.js';
import { protect } from '../middleware/userMiddleware.js';
import { validate, registerSchema, loginSchema } from '../validators/userValidator.js';

const userRouter = express.Router();

// ==================== PUBLIC ROUTES ====================
// These routes don't require authentication

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
userRouter.post('/register', validate(registerSchema), registerUser);

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
userRouter.post('/login', validate(loginSchema), loginUser);

// ==================== PROTECTED ROUTES ====================
// These routes require authentication (valid JWT token)

// @route   GET /api/users/me
// @desc    Get current logged in user profile
// @access  Private
userRouter.get('/me', protect, getMe);

// @route   POST /api/users/logout
// @desc    Logout user
// @access  Private
userRouter.post('/logout', protect, logoutUser);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
// userRouter.put('/profile', protect, validate(updateProfileSchema), updateProfile);

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
// userRouter.put('/change-password', protect, validate(changePasswordSchema), changePassword);

// ==================== OPTIONAL: ADMIN ROUTES ====================
// These routes require admin authentication

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
// userRouter.get('/', protect, admin, getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private/Admin
// userRouter.get('/:id', protect, admin, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user by ID (admin only)
// @access  Private/Admin
// userRouter.put('/:id', protect, admin, updateUserByAdmin);

// @route   DELETE /api/users/:id
// @desc    Delete user by ID (admin only)
// @access  Private/Admin
// userRouter.delete('/:id', protect, admin, deleteUser);

export default userRouter;