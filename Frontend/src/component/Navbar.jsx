// client/src/components/common/Navbar.jsx (Ultimate Version)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../assets/assets';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${searchQuery}`;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo - Extreme Left */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 -ml-2 sm:-ml-3">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
              <img 
                src={Logo} 
                alt="Blog Logo" 
                className="w-9 h-9 object-contain"
              />
            </div>
            <span className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900">
              ThoughtNest
            </span>
          </Link>

          {/* Search - Desktop - Centered */}
          <div className="hidden md:block flex-1 max-w-2xl mx-auto px-8">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-2 pl-11 pr-20 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 text-sm bg-gray-50 hover:bg-white transition-all duration-200"
                />
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"/>
                </svg>
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors border-l border-gray-200 ml-2"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Log in
            </Link>
            <Link to="/signup">
              <button className="px-5 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-colors shadow-sm">
                Sign up
              </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -mr-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus:outline-none transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Section */}
        <div className="md:hidden">
          {/* Search Bar - Mobile - Same design as desktop */}
          <div className="py-3 border-t border-gray-100">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-2 pl-11 pr-20 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 text-sm bg-gray-50 hover:bg-white transition-all duration-200"
                />
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"/>
                </svg>
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors border-l border-gray-200 ml-2"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="py-4 border-t border-gray-100 animate-slideDown">
              <div className="grid grid-cols-2 gap-3">
                {/* Log in */}
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-center text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Log in
                </Link>
                
                {/* Sign up */}
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-center text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

  
    </nav>
  );
};

export default Navbar;