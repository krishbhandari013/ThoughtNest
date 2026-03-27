// client/src/component/Filter.jsx
import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';

const Filter = () => {
  const { filterType, changeFilter, searchQuery, clearSearch } = useBlog();
  const [isAnimating, setIsAnimating] = useState(false);
  console.log("component filtersrc/component/Navbar.jsxre rendered");


  const filters = [
    { id: 'all', label: 'All Posts', description: 'Show all posts' },
    { id: 'latest', label: 'Latest', description: 'Newest first' },
    { id: 'popular', label: 'Popular', description: 'Most viewed' },
    { id: 'oldest', label: 'Oldest', description: 'Oldest first' }
  ];

  const handleFilterClick = (filterId) => {
    if (filterType === filterId) return;
    
    setIsAnimating(true);
    changeFilter(filterId);
    
    setTimeout(() => {
      const blogSection = document.getElementById('blog');
      if (blogSection) {
        blogSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleClearSearch = () => {
    clearSearch();
    
    setTimeout(() => {
      const blogSection = document.getElementById('blog');
      if (blogSection) {
        blogSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const activeFilter = filters.find(f => f.id === filterType);

  return (
    <div className="space-y-6">
      {/* Desktop Filter Bar - Minimal Design */}
      <div className="hidden md:block">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter.id)}
                  className={`relative px-4 py-3 text-sm font-medium transition-all duration-200
                    ${filterType === filter.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Search Status */}
            {searchQuery && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Searching: <span className="font-medium text-gray-900">"{searchQuery}"</span>
                  </span>
                </div>
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter - Segmented Control Style */}
      <div className="md:hidden">
        {/* Search Query Display for Mobile */}
        {searchQuery && (
          <div className="mb-4 flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
            <span className="text-sm text-gray-600">
              Searching: <span className="font-medium text-gray-900">"{searchQuery}"</span>
            </span>
            <button
              onClick={handleClearSearch}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          </div>
        )}

        {/* Filter Options - Horizontal Scroll */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2 min-w-max">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                  ${filterType === filter.id
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filter Indicator */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Active Filter</span>
          <span className="text-sm font-medium text-gray-900">{activeFilter?.label}</span>
        </div>
        
        {isAnimating && (
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <span className="text-xs text-gray-400">Updating</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filter;