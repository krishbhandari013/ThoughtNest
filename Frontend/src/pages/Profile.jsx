// client/src/pages/Profile.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { useUser } from '../context/UserContext';
import BlogCard from '../component/BlogCard';
import profileService from '../services/profileService';
import { toast } from 'react-hot-toast';
import axiosInstance from '../services/axiosInstance';

// ✅ Move helper functions outside component for reusability
const decodeHtmlEntities = (html) => {
  if (!html) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
};

const getPlainTextPreview = (html, maxLength = 200) => {
  if (!html) return '';
  const decoded = decodeHtmlEntities(html);
  const plainText = decoded.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useUser();
  const { getPostsByWriter, loading: blogLoading } = useBlog();
  
  // State management
  const [userPosts, setUserPosts] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingPost, setDeletingPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: []
  });
  
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    socialLinks: {
      twitter: '',
      github: '',
      linkedin: ''
    }
  });

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const response = await profileService.getMyProfile();
        setProfileData(response.data);
        setFormData({
          name: user.name || '',
          email: user.email || '',
          bio: response.data.bio || '',
          location: response.data.location || '',
          website: response.data.website || '',
          socialLinks: {
            twitter: response.data.socialLinks?.twitter || '',
            github: response.data.socialLinks?.github || '',
            linkedin: response.data.socialLinks?.linkedin || ''
          }
        });
        setAvatarPreview(response.data.avatar || '');
        setCoverPreview(response.data.coverImage || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  // Fetch user's posts from API
  const fetchUserPosts = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      const response = await axiosInstance.get('/blogs', {
        params: {
          author: user._id,
          limit: 50
        }
      });
      
      if (response.data.success) {
        setUserPosts(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setUserPosts([]);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setUserPosts([]);
    }
  }, [user?._id]);

  // Get user's posts when user is available
  useEffect(() => {
    if (user?._id) {
      fetchUserPosts();
    }
  }, [user, fetchUserPosts]);

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const response = await profileService.uploadAvatar(file);
      
      if (response.success) {
        setAvatarPreview(response.url);
        setProfileData(prev => ({ ...prev, avatar: response.url }));
        toast.success('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle cover image upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingCover(true);

    try {
      const response = await profileService.uploadCover(file);
      
      if (response.success) {
        setCoverPreview(response.url);
        setProfileData(prev => ({ ...prev, coverImage: response.url }));
        toast.success('Cover image updated successfully!');
      }
    } catch (error) {
      console.error('Cover upload error:', error);
      toast.error(error.message || 'Failed to upload cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  // Save profile changes
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const response = await profileService.updateProfile({
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        socialLinks: formData.socialLinks
      });
      
      if (response.success) {
        setProfileData(prev => ({ ...prev, ...response.data }));
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    setDeletingPost(postId);
    try {
      const response = await axiosInstance.delete(`/blogs/${postId}`);
      if (response.data.success) {
        toast.success('Post deleted successfully!');
        await fetchUserPosts(); // Refresh posts
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(error.response?.data?.message || 'Failed to delete post');
    } finally {
      setDeletingPost(null);
    }
  };

  // Handle edit post
  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditFormData({
      title: post.title || '',
      content: post.content || '',
      excerpt: decodeHtmlEntities(post.excerpt || ''),
      category: post.category || '',
      tags: post.tags || []
    });
  };

  // Handle update post
  const handleUpdatePost = async () => {
    if (!editFormData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const response = await axiosInstance.put(`/blogs/${editingPost._id}`, {
        title: editFormData.title,
        content: editFormData.content,
        excerpt: editFormData.excerpt,
        category: editFormData.category,
        tags: editFormData.tags
      });

      if (response.data.success) {
        toast.success('Post updated successfully!');
        setEditingPost(null);
        await fetchUserPosts(); // Refresh posts
      } else {
        toast.error('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error(error.response?.data?.message || 'Failed to update post');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const updateFormData = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Get user stats
  const getUserStats = () => {
    const posts = Array.isArray(userPosts) ? userPosts : [];
    
    return {
      totalPosts: posts.length,
      totalLikes: posts.reduce((sum, post) => sum + (post.likesCount || post.likes || 0), 0),
      totalComments: posts.reduce((sum, post) => sum + (post.commentsCount || post.comments || 0), 0),
      totalViews: posts.reduce((sum, post) => sum + (post.views || 0), 0),
      totalShares: posts.reduce((sum, post) => sum + (post.shares || 0), 0)
    };
  };

  const stats = getUserStats();

  // Show loading state
  if (authLoading || blogLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">Please login to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Cover Image Section with Edit Button */}
      <div className="relative group">
        <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900">
          {(coverPreview || profileData?.coverImage) ? (
            <>
              <img 
                src={coverPreview || profileData?.coverImage} 
                alt="Cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('bg-gradient-to-r', 'from-gray-800', 'to-gray-900');
                }}
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900"></div>
          )}
          
          {/* Edit Cover Button - Always visible on hover */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {uploadingCover ? 'Uploading...' : (coverPreview || profileData?.coverImage ? 'Change Cover Image' : 'Add Cover Image')}
            </button>
          </div>
          
          {uploadingCover && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                <span className="text-sm">Uploading cover...</span>
              </div>
            </div>
          )}
          
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
        </div>
        
        {/* Profile Info Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 sm:-mt-24 md:-mt-28">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar Section with Edit Button */}
                <div className="relative group">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-white p-1 shadow-2xl">
                    {avatarPreview || profileData?.avatar ? (
                      <img 
                        src={avatarPreview || profileData?.avatar} 
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?background=1e293b&color=fff&size=150&name=${user.name}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                        <span className="text-4xl md:text-5xl font-bold text-white">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Edit Avatar Button */}
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50"
                    title="Change profile picture"
                  >
                    {uploadingAvatar ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                  
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                
                {/* User Info - Display Only */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
                  <p className="text-gray-500 mb-3">{user.email}</p>
                  
                  {formData.bio && (
                    <p className="text-gray-600 max-w-md">{formData.bio}</p>
                  )}
                  
                  {formData.location && (
                    <p className="text-sm text-gray-400 mt-2 flex items-center justify-center md:justify-start gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {formData.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalPosts}</div>
                  <div className="text-xs text-gray-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalLikes.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalComments.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Comments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total Views</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Posts ({stats.totalPosts})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Posts Tab with Edit/Delete */}
        {activeTab === 'posts' && (
          <div>
            {userPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No posts yet</h3>
                <p className="text-gray-500 mb-4">Start writing your first blog post</p>
                <Link to="/create-blog">
                  <button className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200">
                    Create New Post
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {userPosts.map((post, index) => (
                  <div 
                    key={post._id || post.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="p-6">
                      {/* Post Header with Edit/Delete Actions */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <Link to={`/blog/${post._id}`}>
                            <h3 className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                              {post.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{post.views || 0} views</span>
                            <span>•</span>
                            <span>{post.likesCount || 0} likes</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Edit Post"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                                handleDeletePost(post._id);
                              }
                            }}
                            disabled={deletingPost === post._id}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete Post"
                          >
                            {deletingPost === post._id ? (
                              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* ✅ FIXED: Post Preview with proper HTML entity decoding */}
                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {post.excerpt 
                          ? decodeHtmlEntities(post.excerpt)
                          : getPlainTextPreview(post.content, 200)}
                      </p>
                      
                      {/* Post Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {post.category && (
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                              {post.category}
                            </span>
                          )}
                          {post.tags && post.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs">#{tag}</span>
                          ))}
                        </div>
                        <Link 
                          to={`/blog/${post._id}`}
                          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          Read More →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Post Modal */}
        {editingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit Post</h2>
                <button
                  onClick={() => setEditingPost(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Post title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <textarea
                    rows="2"
                    value={editFormData.excerpt}
                    onChange={(e) => setEditFormData({ ...editFormData, excerpt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Short summary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    rows="6"
                    value={editFormData.content}
                    onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Post content"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Category"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editFormData.tags.join(', ')}
                    onChange={(e) => setEditFormData({ 
                      ...editFormData, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="react, javascript, webdev"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdatePost}
                    className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Update Post
                  </button>
                  <button
                    onClick={() => setEditingPost(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Logout
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Avatar Settings */}
                <div className="border-b border-gray-200 pb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden">
                      {avatarPreview || profileData?.avatar ? (
                        <img 
                          src={avatarPreview || profileData?.avatar} 
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-medium
                          file:bg-gray-900 file:text-white
                          hover:file:bg-gray-800
                          cursor-pointer"
                        disabled={uploadingAvatar}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        JPG, PNG or GIF. Max 2MB.
                      </p>
                      {uploadingAvatar && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          <span className="text-xs text-gray-500">Uploading...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cover Image Settings */}
                <div className="border-b border-gray-200 pb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Cover Image</label>
                  <div className="space-y-3">
                    <div className="h-32 w-full rounded-lg overflow-hidden bg-gray-100">
                      {(coverPreview || profileData?.coverImage) ? (
                        <img 
                          src={coverPreview || profileData?.coverImage} 
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-sm text-gray-500">No cover image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-medium
                          file:bg-gray-900 file:text-white
                          hover:file:bg-gray-800
                          cursor-pointer"
                        disabled={uploadingCover}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        JPG, PNG or GIF. Max 5MB. Recommended size: 1200x400px
                      </p>
                      {uploadingCover && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          <span className="text-xs text-gray-500">Uploading...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name and Email (Read-only) */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Contact support to change your name</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Contact support to change your email</p>
                  </div>
                </div>

                {/* Bio */}
                <div className="border-b border-gray-200 pb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    rows="4"
                    value={formData.bio}
                    onChange={(e) => updateFormData('bio', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
                </div>
                
                {/* Location */}
                <div className="border-b border-gray-200 pb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    placeholder="City, Country"
                  />
                </div>
                
                {/* Website */}
                <div className="border-b border-gray-200 pb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateFormData('website', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                
                {/* Social Links */}
                <div className="border-b border-gray-200 pb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Social Links</label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Twitter</label>
                      <input
                        type="text"
                        value={formData.socialLinks.twitter}
                        onChange={(e) => updateFormData('socialLinks.twitter', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                        placeholder="@username"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">GitHub</label>
                      <input
                        type="text"
                        value={formData.socialLinks.github}
                        onChange={(e) => updateFormData('socialLinks.github', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                        placeholder="username"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">LinkedIn</label>
                      <input
                        type="text"
                        value={formData.socialLinks.linkedin}
                        onChange={(e) => updateFormData('socialLinks.linkedin', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                        placeholder="linkedin.com/in/username"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Save Button */}
                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving Changes...' : 'Save All Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Profile;