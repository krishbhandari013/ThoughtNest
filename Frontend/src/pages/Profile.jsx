// client/src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { useUser } from '../context/UserContext';
import BlogCard from '../component/BlogCard';

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout, updateProfile } = useUser();
  const { getPostsByWriter, loading: blogLoading } = useBlog();
  
  const [userPosts, setUserPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    location: '',
    website: '',
    twitter: '',
    github: ''
  });

  // Debug logging
  useEffect(() => {
    console.log('Profile Component - User:', user);
    console.log('Profile Component - Auth Loading:', authLoading);
    console.log('Profile Component - Blog Loading:', blogLoading);
  }, [user, authLoading, blogLoading]);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      console.log('Setting form data for user:', user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        location: user.location || '',
        website: user.website || '',
        twitter: user.twitter || '',
        github: user.github || ''
      });
    }
  }, [user]);

  // Get user's posts when user is available
  useEffect(() => {
    if (user && getPostsByWriter) {
      console.log('Getting posts for writer:', user.name);
      const usersPosts = getPostsByWriter(user.name);
      console.log('User posts found:', usersPosts.length);
      setUserPosts(usersPosts);
    }
  }, [user, getPostsByWriter]);

  const handleSave = async () => {
    console.log('Saving profile:', formData);
    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
      console.log('Profile updated successfully');
    } else {
      console.error('Update failed:', result.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getUserStats = () => {
    return {
      totalPosts: userPosts.length,
      totalLikes: userPosts.reduce((sum, post) => sum + (post.likes || 0), 0),
      totalComments: userPosts.reduce((sum, post) => sum + (post.comments || 0), 0),
      totalViews: userPosts.reduce((sum, post) => sum + (post.views || 0), 0),
      totalShares: userPosts.reduce((sum, post) => sum + (post.shares || 0), 0)
    };
  };

  const stats = getUserStats();

  // Show loading state
  if (authLoading || blogLoading) {
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
    console.log('No user found, redirecting to login');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Please login to view profile</p>
          <Link to="/login" className="mt-4 inline-block text-gray-900 hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-gray-800 to-gray-900"></div>
        
        {/* Profile Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-20 md:-mt-24">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-white p-1 shadow-2xl">
                    {formData.avatar || user.avatar ? (
                      <img 
                        src={formData.avatar || user.avatar} 
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
                </div>
                
                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className="text-2xl md:text-3xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-3 py-1 mb-2 w-full md:w-auto"
                    />
                  ) : (
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
                  )}
                  <p className="text-gray-500 mb-2">{user.email}</p>
                  
                  {formData.bio && !isEditing && (
                    <p className="text-gray-600 max-w-md mt-2">{formData.bio}</p>
                  )}
                  
                  {isEditing && (
                    <textarea
                      rows="3"
                      value={formData.bio}
                      onChange={(e) => updateFormData('bio', e.target.value)}
                      className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-600"
                      placeholder="Tell us about yourself..."
                    />
                  )}
                  
                  {formData.location && !isEditing && (
                    <p className="text-sm text-gray-400 mt-2 flex items-center justify-center md:justify-start gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {formData.location}
                    </p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Stats Section */}
              {!isEditing && (
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
              )}

              {/* Save/Cancel Buttons when Editing */}
              {isEditing && (
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      if (user) {
                        setFormData({
                          name: user.name || '',
                          email: user.email || '',
                          bio: user.bio || '',
                          avatar: user.avatar || '',
                          location: user.location || '',
                          website: user.website || '',
                          twitter: user.twitter || '',
                          github: user.github || ''
                        });
                      }
                    }}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto">
            {['posts', 'saved', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'posts' && `My Posts (${userPosts.length})`}
                {tab === 'saved' && 'Saved'}
                {tab === 'settings' && 'Settings'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Posts Tab */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Saved posts</h3>
            <p className="text-gray-500">Posts you save will appear here</p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  rows="4"
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="City, Country"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="https://yourwebsite.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => updateFormData('twitter', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="@username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => updateFormData('github', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="username"
                />
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleSave}
                  className="w-full px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;