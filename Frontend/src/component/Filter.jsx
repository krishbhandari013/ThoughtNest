// client/src/component/Filter.jsx
import React from 'react';
import { useBlog } from '../context/BlogContext';

const Filter = () => {
  const { filterType, changeFilter, clearFilters } = useBlog();

  const categories = [
    { id: 'all', label: 'All', icon: '📰' },
    { id: 'Technology', label: 'Technology', icon: '💻' },
    { id: 'Web Development', label: 'Web Dev', icon: '🌐' },
    { id: 'JavaScript', label: 'JavaScript', icon: '🟡' },
    { id: 'React', label: 'React', icon: '⚛️' },
    { id: 'Node.js', label: 'Node.js', icon: '🟢' },
    { id: 'Design', label: 'Design', icon: '🎨' },
    { id: 'Career', label: 'Career', icon: '💼' },
    { id: 'AI & ML', label: 'AI/ML', icon: '🤖' },
    { id: 'Startup', label: 'Startup', icon: '🚀' },
    { id: 'Productivity', label: 'Productivity', icon: '⚡' },
  ];

  const handleFilterClick = (filterId) => {
    if (filterId === 'all') {
      clearFilters();
    } else {
      changeFilter(filterId);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium text-gray-600">Filter by category</span>
        </div>
        
        {filterType !== 'all' && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleFilterClick(category.id)}
            className={`group flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              filterType === category.id
                ? 'bg-gray-900 text-white shadow-md scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
            }`}
          >
            <span className="text-base">{category.icon}</span>
            <span>{category.label}</span>
            {filterType === category.id && (
              <svg className="w-3.5 h-3.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
      
      {/* Active filter indicator */}
      {filterType !== 'all' && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Active filter:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              {categories.find(c => c.id === filterType)?.icon}
              {categories.find(c => c.id === filterType)?.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;