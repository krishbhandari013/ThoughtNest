// client/src/components/blog/BlogCard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { useUser } from '../context/UserContext';
import { toast } from 'react-hot-toast';
import CommentItem from './CommentItem';
import { getProfilePath } from '../utils/profileRoutes';


  // Format date
  const formatDate = (dateString) => {
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

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getPlainTextPreview = (content) => {
    if (!content) return '';

    const htmlString = String(content);

    if (typeof window !== 'undefined') {
      const parser = new DOMParser();
      const parsed = parser.parseFromString(htmlString, 'text/html');
      return (parsed.body.textContent || '')
        .replace(/\u00a0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    return htmlString
      .replace(/&nbsp;?/gi, ' ')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
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

const BlogCard = ({ post, onLikeUpdate, onCommentUpdate }) => {
  const { user } = useUser();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || post.likes || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [authorAvatar, setAuthorAvatar] = useState(null);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch author avatar from profile
  useEffect(() => {
    const fetchAuthorAvatar = async () => {
      const authorId = post.author?._id || post.authorId;
      if (authorId && !post.authorAvatar && !post.author?.avatar) {
        try {
          const response = await axiosInstance.get(`/profile/user/${authorId}`);
          if (response.data.success && response.data.data.avatar) {
            setAuthorAvatar(response.data.data.avatar);
          }
        } catch (error) {
          console.error('Error fetching author avatar:', error);
        }
      }
    };
    fetchAuthorAvatar();
  }, [post.author?._id, post.authorId, post.authorAvatar, post.author?.avatar]);

  // Check if user has liked this post
  useEffect(() => {
    if (user && post.likes && post.likes.includes(user._id)) {
      setIsLiked(true);
    }
  }, [user, post.likes]);

  // Fetch comments when showComments is true
  useEffect(() => {
    if (showComments && post._id) {
      fetchComments();
    }
  }, [showComments, post._id]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await axiosInstance.get(`/comments/${post._id}`);
      if (response.data.success) {
        setComments(response.data.data);
        const totalComments = response.data.data.reduce((acc, comment) => 
          acc + 1 + (comment.replies?.length || 0), 0);
        setCommentsCount(totalComments);
        if (onCommentUpdate) {
          onCommentUpdate(post._id, totalComments);
        }
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  // Handle like click with proper API integration
  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    if (isLiking) return;
    
    setIsLiking(true);
    const previousLiked = isLiked;
    const previousCount = likesCount;
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    try {
      const response = await axiosInstance.post(`/blogs/${post._id}/like`);
      if (response.data.success) {
        setLikesCount(response.data.data.likesCount);
        if (onLikeUpdate) {
          onLikeUpdate(post._id, response.data.data.likesCount);
        }
        toast.success(isLiked ? 'Removed like' : 'Liked!');
      } else {
        // Revert on error
        setIsLiked(previousLiked);
        setLikesCount(previousCount);
        toast.error('Failed to update like');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error('Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosInstance.post('/comments', {
        content: newComment.trim(),
        postId: post._id,
      });

      if (response.data.success) {
        setNewComment('');
        await fetchComments();
        toast.success('Comment posted!');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId, content) => {
    if (!content.trim()) return;
    try {
      const response = await axiosInstance.put(`/comments/${commentId}`, {
        content: content.trim(),
      });
      if (response.data.success) {
        await fetchComments();
        toast.success('Comment updated!');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      toast.error('Failed to update comment');
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      const response = await axiosInstance.delete(`/comments/${commentId}`);
      if (response.data.success) {
        await fetchComments();
        toast.success(response.data.message || 'Comment deleted');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleReplyComment = async (parentId, content) => {
    const response = await axiosInstance.post('/comments/reply', {
      content,
      postId: post._id,
      parentId,
    });
    if (response.data.success) {
      await fetchComments();
      toast.success('Reply posted!');
      return;
    }
    throw new Error('Failed to post reply');
  };

  const fetchCommentAuthorAvatar = useCallback(async (userId) => {
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
  }, []);

  const handleCommentsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowComments(!showComments);
  };



  const getAuthorName = () => {
    if (post.authorName) return post.authorName;
    if (post.author?.name) return post.author.name;
    return 'Anonymous';
  };

  const getAuthorAvatar = () => {
    if (authorAvatar) return authorAvatar;
    if (post.authorAvatar) return post.authorAvatar;
    if (post.author?.avatar) return post.author.avatar;
    return null;
  };


  const getExcerpt = () => {
    if (post.excerpt) return getPlainTextPreview(post.excerpt);
    if (post.content) {
      const plainText = getPlainTextPreview(post.content);
      return plainText.substring(0, 120) + (plainText.length > 120 ? '...' : '');
    }
    return 'No preview available';
  };

  const getReadTime = () => {
    if (post.content) {
      const plainText = getPlainTextPreview(post.content);
      const wordCount = plainText.split(/\s+/).length;
      return Math.max(1, Math.ceil(wordCount / 200));
    }
    return 3;
  };



  const authorName = getAuthorName();
  const avatarUrl = getAuthorAvatar();
  const excerpt = getExcerpt();
  const readTime = getReadTime();
  const avatarColor = getAvatarColor(authorName);
  const authorId = post.author?._id || post.authorId;

  return (
    <div className="block group h-full">
      <article className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 h-full flex flex-col">
        
        {/* Gradient Border Top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        
        {/* Featured Badge */}
        {post.featured && (
          <div className="absolute top-4 right-4 z-10">
            <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full shadow-md flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>
          </div>
        )}

        {/* Top Section - Writer Info */}
        <div className="p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Link
                to={getProfilePath(authorId)}
                onClick={(e) => e.stopPropagation()}
                className="block w-11 h-11 rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300"
                aria-label={`View ${authorName}'s profile`}
              >
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={authorName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?background=1e293b&color=fff&size=100&name=${authorName}`;
                    }}
                  />
                ) : (
                  <div className={`w-full h-full ${avatarColor} flex items-center justify-center text-white text-base font-bold`}>
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            </div>
            
            <div className="flex-1">
              <Link
                to={getProfilePath(authorId)}
                onClick={(e) => e.stopPropagation()}
                className="inline-block text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors line-clamp-1"
              >
                {authorName}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-gray-500">
                  {formatDate(post.publishedAt || post.createdAt)}
                </p>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{readTime} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Content */}
        <div className="px-5 pb-4 flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2 group-hover:text-gray-800 transition-colors duration-300">
            {post.title}
          </h3>
          
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
            {excerpt}
          </p>

          {post.category && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                </svg>
                {post.category}
              </span>
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom Section - Engagement Stats */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-100 bg-gray-50/30 group-hover:bg-gray-50/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Likes Button */}
              <button 
                onClick={handleLikeClick}
                disabled={isLiking}
                className={`flex items-center gap-1.5 transition-all duration-300 ${
                  isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLiking ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
                <span className="text-xs font-medium">{formatNumber(likesCount)}</span>
              </button>

              {/* Comments Button */}
              <button 
                onClick={handleCommentsClick}
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-all duration-300 group"
              >
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-xs font-medium">{formatNumber(commentsCount)}</span>
              </button>

              {/* Shares */}
              <div className="flex items-center gap-1.5 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="text-xs font-medium">{formatNumber(post.shares || 0)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-xs font-medium">{formatNumber(post.views || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="px-5 pb-5 pt-3 border-t border-gray-100 bg-white animate-slideDown">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900">
                Comments ({commentsCount})
              </h4>
              <button 
                onClick={() => setShowComments(false)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
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
                    rows="2"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={submitting || !newComment.trim()}
                      className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            {loadingComments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map(comment => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  currentUser={user}
                  onReply={handleReplyComment}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  fetchUserAvatar={fetchCommentAuthorAvatar}
                  formatDate={formatDate}
                  getAvatarColor={getAvatarColor}
                />
              ))
            )}
          </div>
        )}

        {/* Read More Link */}
        <div className="px-5 pb-5 pt-0">
          <Link to={`/blog/${post._id}`} className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-2 group-hover:gap-3">
            Read full story
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </article>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BlogCard;