// client/src/components/blog/BlogCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format numbers (e.g., 1000 -> 1K)
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Get subtle gradient colors for fallback avatar
  const getAvatarColor = (name) => {
    const gradients = [
      'from-gray-600 to-gray-700',
      'from-gray-500 to-gray-600',
      'from-gray-600 to-gray-800',
      'from-gray-700 to-gray-800'
    ];
    const index = name.length % gradients.length;
    return gradients[index];
  };

  // Handle like click
  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  // Handle bookmark click
  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  return (
    <Link to={`/blog/${post.id}`} className="block group h-full">
      <article className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100 h-full flex flex-col">
        
        {/* Subtle Border Top - Minimal */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        
        {/* Featured Badge - Minimal */}
        {post.featured && (
          <div className="absolute top-4 right-4 z-10">
            <span className="px-2.5 py-1 bg-gray-800 text-white text-xs font-medium rounded-full shadow-sm">
              Featured
            </span>
          </div>
        )}

        {/* Top Section - Writer Info */}
        <div className="p-6 pb-3">
          <div className="flex items-center gap-3">
            {/* Writer Profile Image */}
            <div className="flex-shrink-0 relative">
              <div className="w-11 h-11 rounded-full overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 bg-gray-100">
                {post.img ? (
                  <img 
                    src={post.img} 
                    alt={post.writer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor(post.writer.name)} flex items-center justify-center`}>
                    <span className="text-base font-semibold text-white">
                      {post.writer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            
            {/* Writer Info */}
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-1">
                {post.writer.name}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-gray-500">
                  {formatDate(post.date)}
                </p>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {Math.ceil(post.content.length / 500) || 5} min read
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Content */}
        <div className="px-6 pb-4 flex-1">
          {/* Blog Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2 group-hover:text-gray-800 transition-colors duration-300">
            {post.title}
          </h3>
          
          {/* Content Preview */}
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
            {post.content}
          </p>

          {/* Tags Section - Minimal */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full group-hover:bg-gray-100 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section - Engagement Stats */}
        <div className="px-6 pb-6 pt-3 border-t border-gray-100 bg-gray-50/30 group-hover:bg-gray-50/50 transition-colors">
          <div className="flex items-center justify-between">
            {/* Left Stats */}
            <div className="flex items-center gap-5">
              {/* Likes */}
              <button 
                onClick={handleLikeClick}
                className={`flex items-center gap-1.5 transition-all duration-300 ${
                  isLiked 
                    ? 'text-gray-700 scale-110' 
                    : 'text-gray-400 hover:text-gray-600 hover:scale-110'
                }`}
              >
                <svg 
                  className="w-4.5 h-4.5 transition-transform duration-200" 
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.8} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
                <span className="text-xs font-medium">{formatNumber(likesCount)}</span>
              </button>

              {/* Comments */}
              <div className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-all duration-300 cursor-pointer group/stat">
                <svg 
                  className="w-4.5 h-4.5 group-hover/stat:scale-110 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  />
                </svg>
                <span className="text-xs font-medium">{formatNumber(post.comments)}</span>
              </div>

              {/* Shares */}
              <div className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-all duration-300 cursor-pointer group/stat">
                <svg 
                  className="w-4.5 h-4.5 group-hover/stat:scale-110 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
                  />
                </svg>
                <span className="text-xs font-medium">{formatNumber(post.shares)}</span>
              </div>
            </div>

            {/* Right Stats */}
            <div className="flex items-center gap-4">
              {/* Views */}
              <div className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-all duration-300 cursor-pointer group/stat">
                <svg 
                  className="w-4.5 h-4.5 group-hover/stat:scale-110 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                  />
                </svg>
                <span className="text-xs font-medium">{formatNumber(post.views || 0)}</span>
              </div>

              {/* Bookmark */}
              <button 
                onClick={handleBookmarkClick}
                className={`flex items-center gap-1.5 transition-all duration-300 ${
                  isBookmarked 
                    ? 'text-gray-700 scale-110' 
                    : 'text-gray-400 hover:text-gray-600 hover:scale-110'
                }`}
              >
                <svg 
                  className="w-4.5 h-4.5 transition-transform duration-200" 
                  fill={isBookmarked ? "currentColor" : "none"}
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.8} 
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Read More Link */}
        <div className="px-6 pb-5 pt-0">
          <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors inline-flex items-center gap-2 group-hover:gap-3">
            Read full story
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;