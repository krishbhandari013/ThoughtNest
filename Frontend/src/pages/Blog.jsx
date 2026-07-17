// client/src/pages/BlogPostPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { useUser } from '../context/UserContext';
import { toast } from 'react-hot-toast';
import CommentItem from '../component/CommentItem';
import { getProfilePath } from '../utils/profileRoutes';

const BlogPostPage = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [authorAvatar, setAuthorAvatar] = useState(null);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [hasLoadedComments, setHasLoadedComments] = useState(false);
  const contentRef = useRef(null);
  const commentInputRef = useRef(null);

  // Fetch blog post from backend
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/blogs/${id}`);
        
        if (response.data.success) {
          const blogData = response.data.data;
          setPost(blogData);
          setLikesCount(blogData.likesCount || 0);
          
          // Check if user has liked this post
          if (user && blogData.likes && blogData.likes.includes(user._id)) {
            setLiked(true);
          }
          
          // Fetch author avatar if not available
          if (blogData.author?._id && !blogData.author?.avatar) {
            fetchAuthorAvatar(blogData.author._id);
          }
          
          // Fetch related posts
          await fetchRelatedPosts(blogData.category, blogData._id);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast.error('Failed to load blog post');
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, user]);

  useEffect(() => {
    // Reset per-post comment UI state when navigating to another post.
    setIsCommentsOpen(false);
    setHasLoadedComments(false);
    setComments([]);
    setNewComment('');
  }, [id]);

  useEffect(() => {
    if (!isCommentsOpen || !post?._id || hasLoadedComments) return;
    fetchComments(post._id);
  }, [isCommentsOpen, post?._id, hasLoadedComments]);

  useEffect(() => {
    if (!isCommentsOpen) return;
    const timer = setTimeout(() => {
      commentInputRef.current?.focus();
    }, 120);
    return () => clearTimeout(timer);
  }, [isCommentsOpen]);

  // Fetch author avatar from profile
  const fetchAuthorAvatar = async (authorId) => {
    try {
      const response = await axiosInstance.get(`/profile/user/${authorId}`);
      if (response.data.success && response.data.data.avatar) {
        setAuthorAvatar(response.data.data.avatar);
      }
    } catch (error) {
      console.error('Error fetching author avatar:', error);
    }
  };

  const formatCommentDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-gradient-to-br from-purple-500 to-indigo-600',
      'bg-gradient-to-br from-pink-500 to-rose-600',
      'bg-gradient-to-br from-blue-500 to-cyan-600',
      'bg-gradient-to-br from-emerald-500 to-teal-600',
      'bg-gradient-to-br from-amber-500 to-orange-600',
    ];
    const index = name?.length % colors.length || 0;
    return colors[index];
  };

  const fetchComments = async (postId = post?._id) => {
    if (!postId) return;
    setLoadingComments(true);
    try {
      const response = await axiosInstance.get(`/comments/${postId}`);
      if (response.data.success) {
        setComments(response.data.data || []);
        setHasLoadedComments(true);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchCommentAuthorAvatar = async (userId) => {
    if (!userId) return null;
    try {
      const response = await axiosInstance.get(`/profile/user/${userId}`);
      if (response.data.success && response.data.data.avatar) {
        return response.data.data.avatar;
      }
    } catch (error) {
      console.error('Error fetching commenter avatar:', error);
    }
    return null;
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await axiosInstance.post('/comments', {
        content: newComment.trim(),
        postId: post._id,
      });
      if (response.data.success) {
        setNewComment('');
        await fetchComments(post._id);
        toast.success('Comment posted!');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplyComment = async (parentId, content) => {
    const response = await axiosInstance.post('/comments/reply', {
      content,
      postId: post._id,
      parentId,
    });
    if (response.data.success) {
      await fetchComments(post._id);
      toast.success('Reply posted!');
      return;
    }
    throw new Error('Failed to post reply');
  };

  const handleEditComment = async (commentId, content) => {
    const response = await axiosInstance.put(`/comments/${commentId}`, {
      content,
    });
    if (response.data.success) {
      await fetchComments(post._id);
      toast.success('Comment updated!');
      return;
    }
    throw new Error('Failed to update comment');
  };

  const handleDeleteComment = async (commentId) => {
    const response = await axiosInstance.delete(`/comments/${commentId}`);
    if (response.data.success) {
      await fetchComments(post._id);
      toast.success(response.data.message || 'Comment deleted');
      return;
    }
    throw new Error('Failed to delete comment');
  };

  const handleToggleComments = () => {
    setIsCommentsOpen((prev) => !prev);
  };

  // Fetch related posts
  const fetchRelatedPosts = async (category, currentPostId) => {
    try {
      const response = await axiosInstance.get('/blogs', {
        params: {
          category: category,
          limit: 3,
          exclude: currentPostId
        }
      });
      if (response.data.success) {
        setRelatedPosts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  // Handle like/unlike with optimistic update
  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    if (isLiking) return;
    
    setIsLiking(true);
    const previousLiked = liked;
    const previousCount = likesCount;
    
    // Optimistic update
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    
    try {
      const response = await axiosInstance.post(`/blogs/${post._id}/like`);
      
      if (response.data.success) {
        setLikesCount(response.data.data.likesCount);
        toast.success(liked ? 'Removed like' : 'Liked!');
      } else {
        // Revert on error
        setLiked(previousLiked);
        setLikesCount(previousCount);
        toast.error('Failed to update like');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      setLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error('Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    }
  };

  // Decode HTML entities
  const decodeHtmlEntities = (text) => {
    if (!text) return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  // Format content with proper overflow handling
  const formatContent = (content) => {
    if (!content) return null;

    // Decode HTML entities first
    const decodedContent = decodeHtmlEntities(content);
    
    // If content contains HTML tags, render it directly with overflow handling
    if (decodedContent.includes('<') && decodedContent.includes('>')) {
      return (
        <div 
          className="prose prose-lg max-w-none blog-content overflow-x-auto break-words"
          style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
          dangerouslySetInnerHTML={{ __html: decodedContent }}
        />
      );
    }
    
    // Otherwise, format plain text with paragraphs
    return decodedContent.split('\n\n').map((paragraph, index) => {
      if (paragraph.includes('\n- ') || paragraph.includes('\n• ')) {
        const lines = paragraph.split('\n');
        return (
          <div key={index} className="mb-8">
            {lines.map((line, lineIndex) => {
              if (line.startsWith('- ') || line.startsWith('• ')) {
                return (
                  <div key={lineIndex} className="flex items-start gap-3 mb-3">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2.5 flex-shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed break-words">{line.substring(2)}</p>
                  </div>
                );
              }
              return line && <p key={lineIndex} className="text-gray-700 leading-relaxed mb-4 break-words">{line}</p>;
            })}
          </div>
        );
      }
      return (
        <p key={index} className="text-gray-700 leading-relaxed text-lg mb-6 break-words">
          {paragraph}
        </p>
      );
    });
  };

  // Get author name
  const getAuthorName = () => {
    if (post?.authorName) return post.authorName;
    if (post?.author?.name) return post.author.name;
    return 'Anonymous';
  };

  // Get author avatar with priority
  const getAuthorAvatar = () => {
    if (authorAvatar) return authorAvatar;
    if (post?.authorAvatar) return post.authorAvatar;
    if (post?.author?.avatar) return post.author.avatar;
    return null;
  };

  // Get avatar color for fallback
  const getAuthorAvatarColor = (name) => {
    const colors = [
      'from-purple-500 to-indigo-600',
      'from-pink-500 to-rose-600',
      'from-blue-500 to-cyan-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
    ];
    const index = name?.length % colors.length || 0;
    return colors[index];
  };

  const authorName = getAuthorName();
  const authorAvatarUrl = getAuthorAvatar();
  const avatarColor = getAuthorAvatarColor(authorName);
  const authorId = post?.author?._id || post?.authorId;
  const totalCommentsCount = comments.reduce(
    (acc, comment) => acc + 1 + (comment.replies?.length || 0),
    0
  );

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <article className="relative max-w-4xl mx-auto px-4 mt-8 sm:mt-16">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse"></div>
                  <div>
                    <div className="h-5 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-3 mb-8">
                <div className="h-12 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  }

  // Post not found
  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <article className="relative max-w-4xl mx-auto px-4 mt-8 sm:mt-16">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Back Button */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </div>


          {/* Content */}
          <div className="p-6 sm:p-8 lg:p-10">
            {/* Writer Info */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Link
                    to={getProfilePath(authorId)}
                    className="block w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md"
                    aria-label={`View ${authorName}'s profile`}
                  >
                    {authorAvatarUrl ? (
                      <img 
                        src={authorAvatarUrl} 
                        alt={authorName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?background=1e293b&color=fff&size=100&name=${authorName}`;
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xl font-bold`}>
                        {authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div>
                  <Link to={getProfilePath(authorId)} className="font-semibold text-gray-900 text-lg hover:text-gray-700 transition-colors">
                    {authorName}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>
              </div>
              
              {/* Views Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">{post.views?.toLocaleString() || 0} views</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight break-words">
              {post.title} 
            </h1>
            {/* Category Badge */}
            {post.category && (
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                  </svg>
                  {post.category}
                </span>
              </div>
            )}
            
          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative w-full h-64 md:h-96 overflow-hidden bg-gray-100">
              <img 
                src={post.coverImage} 
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('bg-gradient-to-r', 'from-gray-800', 'to-gray-900');
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          )}

            {/* Content with overflow handling */}
            <div 
              ref={contentRef} 
              className="prose prose-lg max-w-none blog-content overflow-x-auto break-words"
              style={{ 
                wordWrap: 'break-word', 
                overflowWrap: 'break-word',
                maxWidth: '100%'
              }}
            >
              {formatContent(post.content)}
            </div>

            {/* Tags Section */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interaction Section */}
            <div className="mt-10 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Like Button */}
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      liked 
                        ? 'bg-red-50 text-red-500' 
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                    } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLiking ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg 
                        className="w-5 h-5 transition-transform group-hover:scale-110" 
                        fill={liked ? 'currentColor' : 'none'} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                    <span className="text-sm font-medium">{likesCount.toLocaleString()}</span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={handleToggleComments}
                    className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      isCommentsOpen
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium">
                      {isCommentsOpen ? 'Hide Comments' : 'Comments'} ({totalCommentsCount || post.commentsCount || 0})
                    </span>
                  </button>
                </div>

                {/* Share Button */}
                <div className="relative">
                  <button
                    onClick={handleShare}
                    className="group flex items-center gap-2 px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300 hover:shadow-md"
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      Share
                    </span>
                  </button>
                  
                  {showShareTooltip && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap animate-fadeIn">
                      Link copied!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isCommentsOpen && (
          <div className="mt-12 bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 animate-slideDown">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Comments ({totalCommentsCount || post.commentsCount || 0})</h3>

            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-xs font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    ref={commentInputRef}
                    rows="2"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {loadingComments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  currentUser={user}
                  onReply={handleReplyComment}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  fetchUserAvatar={fetchCommentAuthorAvatar}
                  formatDate={formatCommentDate}
                  getAvatarColor={getAvatarColor}
                />
              ))
            )}
          </div>
        )}

        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link 
                  key={relatedPost._id} 
                  to={`/blog/${relatedPost._id}`}
                  className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {relatedPost.coverImage && (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={relatedPost.coverImage} 
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 break-words">
                      {relatedPost.title}
                    </h4>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{relatedPost.authorName || relatedPost.author?.name || 'Anonymous'}</span>
                      <span>{new Date(relatedPost.publishedAt || relatedPost.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center py-8 text-sm text-gray-400">
          <p>Thank you for reading • Share your thoughts in the comments</p>
        </div>
      </article>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }

        /* Blog content styling with overflow protection */
        .blog-content {
          overflow-x: auto;
          word-wrap: break-word;
          overflow-wrap: break-word;
          max-width: 100%;
        }
        
        .blog-content * {
          max-width: 100%;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4,
        .blog-content h5,
        .blog-content h6 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 700;
          line-height: 1.3;
        }
        
        .blog-content p {
          margin-bottom: 1.25em;
          line-height: 1.7;
        }
        
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          display: block;
        }
        
        .blog-content pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        
        .blog-content code {
          background: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: monospace;
        }
        
        .blog-content pre code {
          background: transparent;
          padding: 0;
          color: inherit;
        }
        
        .blog-content blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #4b5563;
          font-style: italic;
        }
        
        .blog-content ul, 
        .blog-content ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        
        .blog-content li {
          margin: 0.25rem 0;
        }
        
        .blog-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        .blog-content a:hover {
          color: #1d4ed8;
        }
        
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          overflow-x: auto;
          display: block;
        }
        
        .blog-content th,
        .blog-content td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          text-align: left;
        }
        
        .blog-content th {
          background: #f3f4f6;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default BlogPostPage;