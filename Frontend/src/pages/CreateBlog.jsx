// client/src/pages/CreateBlog.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import RichTextEditor from '../component/RichTextEditor';
import ImageUploader from '../component/ImageUploader';
import TagInput from '../component/TagInput';
import axiosInstance from '../services/axiosInstance';

const CreateBlog = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    category: '',
    tags: [],
    status: 'draft', // draft or published
  });

  const categories = [
    'Technology',
    'Web Development',
    'JavaScript',
    'React',
    'Node.js',
    'Design',
    'Career',
    'AI & ML',
    'Startup',
    'Productivity',
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content: content
    });
  };

  const handleImageUpload = (imageUrl) => {
    setFormData({
      ...formData,
      coverImage: imageUrl
    });
  };

  const handleTagsChange = (tags) => {
    setFormData({
      ...formData,
      tags: tags
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Please enter a title');
      return false;
    }
    if (!formData.content.trim()) {
      setError('Please enter content');
      return false;
    }
    if (formData.title.length < 5) {
      setError('Title must be at least 5 characters');
      return false;
    }
    if (formData.title.length > 100) {
      setError('Title cannot exceed 100 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e, status) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    const blogData = {
      ...formData,
      status: status,
      author: user?._id,
      authorName: user?.name,
      publishedAt: status === 'published' ? new Date() : null,
    };

    try {
      // TODO: Replace with actual API call
      const response = await axiosInstance.post('/blogs', blogData);
      
      if (response.data.success) {
        navigate(`/blog/${response.data.data.slug}`);
      }
    } catch (err) {
      console.error('Error creating blog:', err);
      setError(err.response?.data?.message || 'Failed to create blog post');
    } finally {
      setLoading(false);
    }
  };

  // Generate excerpt from content
  const generateExcerpt = (content, length = 160) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    if (plainText.length <= length) return plainText;
    return plainText.substring(0, length) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Write a Story</h1>
          <p className="text-gray-600 mt-1">Share your thoughts with the world</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Form */}
        <form className="space-y-6">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <ImageUploader
              onImageUpload={handleImageUpload}
              currentImage={formData.coverImage}
            />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a compelling title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg"
              maxLength="100"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <TagInput
              tags={formData.tags}
              onTagsChange={handleTagsChange}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Write your story..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={loading}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'published')}
              disabled={loading}
              className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex-1"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Publish Post'
              )}
            </button>
          </div>
        </form>

        {/* Preview Section (Optional) */}
        {formData.content && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              {formData.coverImage && (
                <img
                  src={formData.coverImage}
                  alt="Cover preview"
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title}</h1>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: formData.content }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateBlog;