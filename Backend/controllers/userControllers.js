import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// server/controllers/userControllers.js
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // ✅ Password is required for email registration
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Create user with password (only for email registration)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // This will be hashed by pre-save hook
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};



// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ✅ Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // ✅ Find user by email (include password field)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    // ✅ Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // ✅ Check password
    const isPasswordMatch = await user.matchPassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // ✅ Generate token
    const token = generateToken(user._id);
    
    // ✅ Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token
      }
    });
    
  } catch (error) {
    // ✅ Log the actual error for debugging
    console.error('Login error details:', error);
    
    // ✅ Send appropriate error response
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
// controllers/userControllers.js
export const getMe = async (req, res) => {
  try {
    // ✅ Check if req.user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // ✅ Check if req.user has id
    if (!req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user data'
      });
    }
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  try {
    // In JWT based auth, logout is handled client-side by removing token
    // But we can add token to blacklist if needed
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// const updateProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Update fields if provided
//     if (req.body.name) user.name = req.body.name.trim();
//     if (req.body.email) user.email = req.body.email.toLowerCase().trim();
//     if (req.body.bio !== undefined) user.bio = req.body.bio;
//     if (req.body.avatar) user.avatar = req.body.avatar;
//     if (req.body.location) user.location = req.body.location;
//     if (req.body.website) user.website = req.body.website;

//     // Save updated user
//     await user.save();

//     // Remove password from response
//     const userResponse = user.toObject();
//     delete userResponse.password;

//     res.status(200).json({
//       success: true,
//       message: 'Profile updated successfully',
//       data: userResponse
//     });
//   } catch (error) {
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors
//       });
//     }

//     // Handle duplicate email
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email already exists'
//       });
//     }

//     console.error('Update profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error during profile update',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
// const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;

//     // Get user with password
//     const user = await User.findById(req.user.id).select('+password');
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Check current password
//     const isPasswordMatch = await user.matchPassword(currentPassword);
//     if (!isPasswordMatch) {
//       return res.status(401).json({
//         success: false,
//         message: 'Current password is incorrect'
//       });
//     }

//     // Update password
//     user.password = newPassword;
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: 'Password changed successfully'
//     });
//   } catch (error) {
//     console.error('Change password error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error during password change',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };
