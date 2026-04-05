// client/src/pages/CreateBlog.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import RichTextEditor from '../component/RichTextEditor';
import ImageUploader from '../component/ImageUploader';
import TagInput from '../component/TagInput';
import BlogCard from '../component/BlogCard';
import axiosInstance from '../services/axiosInstance';

const CreateBlog = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    category: '',
    tags: [],
    status: 'draft',
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/create-blog', message: 'Please login to write a blog' } });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
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
      setError('Title is required');
      return false;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
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

  const plainTextContent = formData.content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount = plainTextContent ? plainTextContent.split(' ').length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const canPublish = Boolean(formData.title.trim() && formData.content.trim());
  const previewPost = {
    id: 'preview',
    title: formData.title || 'Untitled Story',
    content: formData.excerpt || plainTextContent || 'Start writing to see your blog card preview.',
    tags: formData.tags,
    featured: false,
    img: user?.avatar || '',
    writer: {
      name: user?.name || 'Guest Writer',
    },
    date: new Date().toISOString(),
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show message (redirect will happen via useEffect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to write a blog post.</p>
          <button
            onClick={() => navigate('/login', { state: { from: '/create-blog' } })}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
  <div className="border-b border-gray-100 pb-8">
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
         
        </div>
        <h1 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight">
          Create a <span className="font-semibold">New Story</span>
        </h1>
        <div className="w-full h-0.5 bg-gray-900 mt-4"></div>
      
      </div>
      
      <button
        type="button"
        onClick={() => setShowPreview(!showPreview)}
        className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <span className="text-sm font-medium">{showPreview ? 'Back to Writing' : 'Preview Story'}</span>
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={showPreview ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
        </svg>
      </button>
    </div>
  </div>
</div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">x</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            {!showPreview ? (
              <form className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-7 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Image</label>
                    <ImageUploader
                      onImageUpload={handleImageUpload}
                      currentImage={formData.coverImage}
                    />
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Write a strong, specific title"
                      className={`w-full px-4 py-3 border ${error && !formData.title ? 'border-red-500' : 'border-slate-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-lg`}
                      maxLength="100"
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-slate-500">{formData.title.length}/100 characters</p>
                      {formData.title && formData.title.length < 5 && (
                        <p className="text-xs text-amber-600">Minimum 5 characters</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="excerpt" className="block text-sm font-semibold text-slate-700 mb-2">Excerpt</label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleChange}
                      placeholder="Add a short summary that appears in blog cards"
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      maxLength="220"
                    />
                    <p className="text-xs text-slate-500 mt-2">{formData.excerpt.length}/220 characters</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
                      <TagInput
                        tags={formData.tags}
                        onTagsChange={handleTagsChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Content <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={handleContentChange}
                      placeholder="Start writing your post..."
                    />
                    {!formData.content && (
                      <p className="text-xs text-red-500 mt-2">Content is required</p>
                    )}
                  </div>

                  <div className="text-xs text-slate-500">Fields marked with * are required before publishing.</div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, 'draft')}
                      disabled={loading}
                      className="px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, 'published')}
                      disabled={loading || !canPublish}
                      className={`px-5 py-2.5 font-medium rounded-lg transition-colors sm:ml-auto ${
                        !canPublish ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {loading ? 'Publishing...' : 'Publish Story'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-700 mb-3">Card Preview</p>
                  <div className="max-w-xl pointer-events-none">
                    <BlogCard post={previewPost} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6 text-sm text-slate-600">
                  This preview matches how your post appears in listing cards. Open the blog after publishing to see the full article layout.
                </div>

                <div className="mt-8 pt-5 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Back To Editor
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'published')}
                    disabled={loading || !canPublish}
                    className={`px-4 py-2.5 rounded-lg sm:ml-auto transition-colors ${
                      !canPublish ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {loading ? 'Publishing...' : 'Publish Now'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-500">Post Summary</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Words</p>
                  <p className="text-lg font-semibold text-slate-900">{wordCount}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Read Time</p>
                  <p className="text-lg font-semibold text-slate-900">{readingTime}m</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Tags</p>
                  <p className="text-lg font-semibold text-slate-900">{formData.tags.length}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="text-lg font-semibold text-slate-900">{canPublish ? 'Ready' : 'Draft'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-500">Publishing Checklist</h3>
              <div className="mt-4 space-y-3 text-sm">
                <p className={`${formData.title.trim() ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {formData.title.trim() ? 'Complete' : 'Pending'} title
                </p>
                <p className={`${formData.content.trim() ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {formData.content.trim() ? 'Complete' : 'Pending'} main content
                </p>
                <p className={`${formData.coverImage ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {formData.coverImage ? 'Complete' : 'Optional'} cover image
                </p>
                <p className={`${formData.tags.length ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {formData.tags.length ? 'Complete' : 'Optional'} tags
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h4 className="text-sm font-semibold text-amber-900">Writing Guidance</h4>
              <div className="mt-3 space-y-2 text-xs text-amber-900/90">
                <p>Keep your title clear and specific.</p>
                <p>Use short paragraphs for better readability.</p>
                <p>Add one key image to increase engagement.</p>
                <p>Do a final proofread before publishing.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;