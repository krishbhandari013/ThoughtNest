// client/src/pages/HomePage.jsx
import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useBlog } from '../context/BlogContext';
import HeroSection from '../component/HeroSection';
import SkeletonCard from '../component/SkeletonCard';
import Filter from '../component/Filter';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';

import BlogCard from '../component/BlogCard';

const Home = () => {
  const { performSearch, searchQuery, filterType, clearSearch } = useBlog();
  const [searchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const blogRef = useRef(null);

  // Fetch blogs from backend
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        status: 'published',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 9
      };
      
      // Add category filter
      if (filterType && filterType !== 'all') {
        params.category = filterType;
      }
      
      // Add search query
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await axiosInstance.get('/blogs', { params });
      
      if (response.data.success) {
        setBlogs(response.data.data);
        setTotalPosts(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch blogs when filter or search changes
  useEffect(() => {
    fetchBlogs();
  }, [filterType, searchQuery]);

  // Sync URL query parameter with search
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery !== searchQuery) {
      performSearch(urlQuery);
    }
  }, [searchParams, performSearch, searchQuery]);

  // Scroll to blog section when search or filter is applied
  useEffect(() => {
    if (searchQuery || filterType !== 'all') {
      if (blogRef.current) {
        setTimeout(() => {
          blogRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 200);
      }
    }
  }, [searchQuery, filterType]);

  if (loading) {
    return (
      <>
        <HeroSection />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          }
        >
          {/* Blog Section with id="blog" */}
          <section id="blog" ref={blogRef} className="scroll-mt-20">
            {/* Filter Component */}
            <Filter />
            
            {/* Search Results Info */}
            {searchQuery && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-blue-800 font-medium">
                        Showing results for: <strong className="text-blue-900">"{searchQuery}"</strong>
                      </p>
                    </div>
                    <p className="text-sm text-blue-600 mt-1 ml-7">
                      Found {totalPosts} post(s)
                    </p>
                  </div>
                  <button
                    onClick={clearSearch}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 bg-white rounded-lg shadow-sm hover:shadow transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Filter Info */}
            {filterType !== 'all' && !searchQuery && (
              <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <p className="text-gray-700">
                    Showing <strong className="capitalize text-gray-900">{filterType}</strong> posts
                  </p>
                </div>
              </div>
            )}

            {/* Posts Grid */}
            {blogs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <svg
                  className="mx-auto h-16 w-16 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  No posts found
                </h3>
                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                  {searchQuery 
                    ? `We couldn't find any articles matching "${searchQuery}". Try different keywords or browse all articles.`
                    : "No articles available in this category yet. Check back later!"}
                </p>
                {(searchQuery || filterType !== 'all') && (
                  <button
                    onClick={clearSearch}
                    className="mt-6 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Browse All Articles
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {blogs.map((post, index) => (
                  <div 
                    key={post._id}
                    className="animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'backwards' }}
                  >
                    <BlogCard post={post} />
                  </div>
                ))}
              </div>
            )}
          </section>
          
        </Suspense>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Home;