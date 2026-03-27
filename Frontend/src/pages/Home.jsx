// client/src/pages/HomePage.jsx
import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { useBlog } from '../context/BlogContext';
import HeroSection from '../component/HeroSection';
import SkeletonCard from '../component/SkeletonCard';
import Filter from '../component/Filter';
import { useSearchParams } from 'react-router-dom';

// Lazy load BlogCard for better performance
const BlogCard = lazy(() => import('../component/BlogCard'));

const Home = () => {
  const { posts, loading, performSearch, searchQuery, filterType } = useBlog();
  const [searchParams] = useSearchParams();
  const blogRef = useRef(null);
  console.log("component homepage re rendered");


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
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-blue-700">
                  Showing results for: <strong>"{searchQuery}"</strong>
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Found {posts.length} post(s)
                </p>
              </div>
            )}

            {/* Filter Info */}
            {filterType !== 'all' && !searchQuery && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <p className="text-gray-700">
                  Showing <strong className="capitalize">{filterType}</strong> posts
                </p>
              </div>
            )}

            {/* Posts Grid */}
            {posts.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No posts found
                </h3>
                <p className="mt-2 text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>
        </Suspense>
      </div>
    </>
  );
};

export default Home;