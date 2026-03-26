// client/src/pages/HomePage.jsx
import React, { Suspense, lazy } from 'react';
import { useBlog } from '../context/BlogContext';
import HeroSection from '../component/HeroSection';
import SkeletonCard from '../component/SkeletonCard';

// Lazy load BlogCard for better performance
const BlogCard = lazy(() => import('../component/BlogCard'));

const Home = () => {
  const { posts } = useBlog();

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
           <section id="blog" className="scroll-mt-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </section>

         
        </Suspense>
      </div>
    </>
  );
};

export default Home;