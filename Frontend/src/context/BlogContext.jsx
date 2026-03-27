// client/src/context/BlogContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { blogPosts } from '../assets/assets';

const BlogContext = createContext();

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within BlogProvider');
  }
  return context;
};

// Custom hook for selective subscription (optional)
export const useBlogSelector = (selector) => {
  const context = useContext(BlogContext);
  const [selectedValue, setSelectedValue] = useState(() => selector(context));
  
  useEffect(() => {
    const newValue = selector(context);
    if (newValue !== selectedValue) {
      setSelectedValue(newValue);
    }
  }, [context, selector, selectedValue]);
  
  return selectedValue;
};

export const BlogProvider = ({ children }) => {
  const [allPosts, setAllPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Use ref to prevent unnecessary re-renders
  const searchTimeoutRef = useRef(null);
  const previousSearchQuery = useRef('');
  const previousFilterType = useRef('all');

  // Load initial blog posts
  useEffect(() => {
    console.log('Loading posts...', blogPosts);
    setAllPosts(blogPosts);
    setLoading(false);
  }, []);

  // Memoize filtered and sorted posts - only recomputes when dependencies change
  const filteredAndSortedPosts = useMemo(() => {
    console.log('Recomputing filtered posts...', { searchQuery, filterType });
    
    let result = [...allPosts];

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(post => {
        const matches = 
          (post.title && post.title.toLowerCase().includes(query)) ||
          (post.content && post.content.toLowerCase().includes(query)) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
          (post.writer && post.writer.name && post.writer.name.toLowerCase().includes(query)) ||
          (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)));
        
        if (matches) {
          console.log('Post matched:', post.title);
        }
        return matches;
      });
    }

    // Apply sorting/filtering
    switch (filterType) {
      case 'latest':
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'popular':
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        // 'all' - keep original order
        result.sort((a, b) => a.id - b.id);
        break;
    }

    console.log('Filtered posts count:', result.length);
    return result;
  }, [allPosts, searchQuery, filterType]); // Only recompute when these change

  // Memoize paginated posts (if you add pagination later)
  const posts = useMemo(() => {
    return filteredAndSortedPosts;
  }, [filteredAndSortedPosts]);

  // Memoize functions with useCallback to prevent recreation on every render
  const performSearch = useCallback((query) => {
    console.log('Performing search:', query);
    // Skip if same as current
    if (query === previousSearchQuery.current) return;
    previousSearchQuery.current = query;
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    console.log('Clearing search');
    if (previousSearchQuery.current === '') return;
    previousSearchQuery.current = '';
    setSearchQuery('');
  }, []);

  const changeFilter = useCallback((filter) => {
    console.log('Changing filter:', filter);
    // Skip if same as current
    if (filter === previousFilterType.current) return;
    previousFilterType.current = filter;
    setFilterType(filter);
  }, []);

  // Debounced search for better performance (optional)
  const debouncedSearch = useCallback((query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  }, [performSearch]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    posts,
    allPosts,
    searchQuery,
    filterType,
    loading,
    performSearch,
    clearSearch,
    changeFilter,
    // Optional: expose debounced version
    debouncedSearch
  }), [posts, allPosts, searchQuery, filterType, loading, performSearch, clearSearch, changeFilter, debouncedSearch]);

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};