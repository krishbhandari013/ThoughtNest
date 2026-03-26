// client/src/components/home/HeroSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
          }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        {/* Gradient Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fadeInUp">
          Feel Free to Share
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-white">
            Your Thought
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeInUp animation-delay-200">
          Join a community of thinkers, writers, and creators. Share your ideas, 
          inspire others, and discover stories that matter.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp animation-delay-400">
          <Link to="/create-blog">
            <button className="group relative px-8 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <span className="relative z-10 flex items-center gap-2">
                Start Writing
                <svg 
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </button>
          </Link>
          
          <a href="#blog">
            <button className="group px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105">
              <span className="flex items-center gap-2">
                Explore Blogs
                <svg 
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </a>
        </div>

        {/* Scroll Indicator */}
        
      </div>

      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 z-5 pointer-events-none opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px'
        }}></div>
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
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default HeroSection;