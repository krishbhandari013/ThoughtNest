// client/src/pages/BlogPostPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';

const Blog = () => {
  const { id } = useParams();
  const { allPosts } = useBlog();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      const foundPost = allPosts.find(p => p.id === parseInt(id));
      setPost(foundPost);
      if (foundPost) {
        setLikesCount(foundPost.likes || 0);
      }
      setLoading(false);
    }, 500);
  }, [id, allPosts]);

  const handleLike = () => {
    if (!liked) {
      setLikesCount(prev => prev + 1);
      setLiked(true);
    } else {
      setLikesCount(prev => prev - 1);
      setLiked(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Format content with paragraphs
  const formatContent = (content) => {
    if (!content) return null;
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.includes('\n- ') || paragraph.includes('\n• ')) {
        const lines = paragraph.split('\n');
        return (
          <div key={index} className="mb-8">
            {lines.map((line, lineIndex) => {
              if (line.startsWith('- ') || line.startsWith('• ')) {
                return (
                  <div key={lineIndex} className="flex items-start gap-3 mb-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                    <p className="text-gray-700 leading-relaxed">{line.substring(2)}</p>
                  </div>
                );
              }
              return line && <p key={lineIndex} className="text-gray-700 leading-relaxed mb-4">{line}</p>;
            })}
          </div>
        );
      }
      return (
        <p key={index} className="text-gray-700 leading-relaxed text-lg mb-6">
          {paragraph}
        </p>
      );
    });
  };

  // Loading Skeleton - Matches exact blog post layout
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <article className="relative max-w-4xl mx-auto px-4 mt-8 sm:mt-16">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Back Button Skeleton */}
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Content Skeleton */}
            <div className="p-6 sm:p-8 lg:p-10">
              {/* Writer Info Skeleton */}
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

              {/* Title Skeleton */}
              <div className="space-y-3 mb-8">
                <div className="h-12 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>

              {/* Content Paragraphs Skeleton */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                </div>
             
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>

              {/* Tags Skeleton */}
              

              {/* Interaction Buttons Skeleton */}
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
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                    {post.img? (
                      <img 
                        src={post.img} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-600 text-lg font-serif">
                        {post.writer?.name?.charAt(0) || 'A'}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{post.writer?.name || 'Anonymous'}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(post.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>
              </div>
              
              {/* Views Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">{post.views?.toLocaleString() || 0} views</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Cover Image */}
           

            {/* Content */}
            <div ref={contentRef} className="prose prose-lg max-w-none">
              {formatContent(post.content)}
            </div>

            {/* Tags Section */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-100">
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
                    className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      liked 
                        ? 'bg-red-50 text-red-500' 
                        : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <svg 
                      className="w-5 h-5 transition-transform group-hover:scale-110" 
                      fill={liked ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm font-medium">{likesCount.toLocaleString()}</span>
                  </button>

                  {/* Comment Button */}
                  <button className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300">
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium">{post.comments || 0}</span>
                  </button>
                </div>

                {/* Share Button */}
                <div className="relative">
                  <button
                    onClick={handleShare}
                    className="group flex items-center gap-2 px-5 py-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-300 hover:shadow-md"
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      {post.shares || 0} shares
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

        {/* Footer Note */}
        <div className="text-center py-8 text-sm text-gray-400">
          <p>Thank you for reading • Share your thoughts in the comments</p>
        </div>
      </article>

      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default Blog;