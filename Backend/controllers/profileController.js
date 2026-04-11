// server/controllers/profileController.js
import Profile from '../models/Profile.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// Helper function to upload to Cloudinary (ONLY DECLARE ONCE)
const uploadToCloudinary = async (file, folder) => {
  const b64 = Buffer.from(file.buffer).toString('base64');
  const dataURI = `data:${file.mimetype};base64,${b64}`;
  
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: `thoughtnest/${folder}`,
    transformation: folder === 'avatars' 
      ? [{ width: 300, height: 300, crop: 'fill' }, { quality: 'auto' }]
      : [{ width: 1200, height: 400, crop: 'fill' }, { quality: 'auto' }]
  });
  
  return result;
};

// Get or create user profile
export const getOrCreateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      // Create new profile
      profile = await Profile.create({
        user: userId,
        bio: '',
        avatar: '',
        coverImage: '',
        location: '',
        website: '',
        socialLinks: {},
      });
    }
    
    // Get user basic info
    const user = await User.findById(userId).select('name email');
    
    res.status(200).json({
      success: true,
      data: {
        ...profile.toObject(),
        name: user?.name,
        email: user?.email,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, location, website, socialLinks } = req.body;
    
    let profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      profile = await Profile.create({ user: userId });
    }
    
    // Update fields
    if (bio !== undefined) profile.bio = bio;
    if (location !== undefined) profile.location = location;
    if (website !== undefined) profile.website = website;
    if (socialLinks !== undefined) {
      profile.socialLinks = {
        ...profile.socialLinks,
        ...socialLinks,
      };
    }
    
    await profile.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

// Upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file, 'avatars');
    
    // Find or create profile
    let profile = await Profile.findOne({ user: userId });
    if (!profile) {
      profile = await Profile.create({ user: userId });
    }
    
    // Delete old avatar from Cloudinary if exists
    if (profile.avatarPublicId) {
      await cloudinary.uploader.destroy(profile.avatarPublicId);
    }
    
    // Update profile with new avatar
    profile.avatar = result.secure_url;
    profile.avatarPublicId = result.public_id;
    await profile.save();
    
    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message,
    });
  }
};

// Upload cover image
export const uploadCover = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file, 'covers');
    
    // Find or create profile
    let profile = await Profile.findOne({ user: userId });
    if (!profile) {
      profile = await Profile.create({ user: userId });
    }
    
    // Delete old cover from Cloudinary if exists
    if (profile.coverPublicId) {
      await cloudinary.uploader.destroy(profile.coverPublicId);
    }
    
    // Update profile with new cover
    profile.coverImage = result.secure_url;
    profile.coverPublicId = result.public_id;
    await profile.save();
    
    res.status(200).json({
      success: true,
      message: 'Cover image uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Upload cover error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload cover image',
      error: error.message,
    });
  }
};

// Delete avatar
export const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profile = await Profile.findOne({ user: userId });
    
    if (!profile || !profile.avatarPublicId) {
      return res.status(404).json({
        success: false,
        message: 'No avatar found to delete',
      });
    }
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(profile.avatarPublicId);
    
    // Update profile
    profile.avatar = '';
    profile.avatarPublicId = '';
    await profile.save();
    
    res.status(200).json({
      success: true,
      message: 'Avatar deleted successfully',
    });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete avatar',
      error: error.message,
    });
  }
};

// Delete cover image
export const deleteCover = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profile = await Profile.findOne({ user: userId });
    
    if (!profile || !profile.coverPublicId) {
      return res.status(404).json({
        success: false,
        message: 'No cover image found to delete',
      });
    }
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(profile.coverPublicId);
    
    // Update profile
    profile.coverImage = '';
    profile.coverPublicId = '';
    await profile.save();
    
    res.status(200).json({
      success: true,
      message: 'Cover image deleted successfully',
    });
  } catch (error) {
    console.error('Delete cover error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete cover image',
      error: error.message,
    });
  }
};

// Get profile by user ID (for public viewing)
export const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const profile = await Profile.findOne({ user: userId });
    const user = await User.findById(userId).select('name email');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...profile.toObject(),
        name: user?.name,
        email: user?.email,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
};

// Update profile stats (for internal use)
export const updateProfileStats = async (userId, stats) => {
  try {
    const profile = await Profile.findOne({ user: userId });
    if (profile) {
      if (stats.totalPosts !== undefined) profile.stats.totalPosts += stats.totalPosts;
      if (stats.totalLikes !== undefined) profile.stats.totalLikes += stats.totalLikes;
      if (stats.totalComments !== undefined) profile.stats.totalComments += stats.totalComments;
      if (stats.totalViews !== undefined) profile.stats.totalViews += stats.totalViews;
      await profile.save();
    }
  } catch (error) {
    console.error('Update profile stats error:', error);
  }
};