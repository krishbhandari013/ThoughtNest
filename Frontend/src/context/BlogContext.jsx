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
    if (blogPosts && Array.isArray(blogPosts)) {
      setAllPosts(blogPosts);
    } else {
      console.error('blogPosts is not an array:', blogPosts);
      setAllPosts([]);
    }
    setLoading(false);
  }, []);

  // ✅ Get posts by writer name - ADD THIS FUNCTION
  const getPostsByWriter = useCallback((writerName) => {
    if (!allPosts || !Array.isArray(allPosts)) return [];
    return allPosts.filter(post => post?.writer?.name === writerName);
  }, [allPosts]);

  // ✅ Get post by ID - ADD THIS FUNCTION
  const getPostById = useCallback((id) => {
    if (!allPosts || !Array.isArray(allPosts)) return null;
    return allPosts.find(post => post?.id === parseInt(id));
  }, [allPosts]);

  // ✅ Get latest posts - ADD THIS FUNCTION
  const getLatestPosts = useCallback((limit = 6) => {
    if (!allPosts || !Array.isArray(allPosts)) return [];
    return [...allPosts]
      .sort((a, b) => new Date(b?.date) - new Date(a?.date))
      .slice(0, limit);
  }, [allPosts]);

  // ✅ Get trending posts - ADD THIS FUNCTION
  const getTrendingPosts = useCallback((limit = 4) => {
    if (!allPosts || !Array.isArray(allPosts)) return [];
    return [...allPosts]
      .sort((a, b) => (b?.likes + b?.comments + b?.shares) - (a?.likes + a?.comments + a?.shares))
      .slice(0, limit);
  }, [allPosts]);

  // Memoize filtered and sorted posts
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
        result.sort((a, b) => a.id - b.id);
        break;
    }

    return result;
  }, [allPosts, searchQuery, filterType]);

  const posts = useMemo(() => filteredAndSortedPosts, [filteredAndSortedPosts]);

  const performSearch = useCallback((query) => {
    console.log('Performing search:', query);
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
    if (filter === previousFilterType.current) return;
    previousFilterType.current = filter;
    setFilterType(filter);
  }, []);

  const debouncedSearch = useCallback((query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  }, [performSearch]);

  // ✅ Include all functions in the context value
  const value = useMemo(() => ({
    posts,
    allPosts,
    searchQuery,
    filterType,
    loading,
    performSearch,
    clearSearch,
    changeFilter,
    debouncedSearch,
    // ✅ Add these new functions
    getPostsByWriter,
    getPostById,
    getLatestPosts,
    getTrendingPosts
  }), [posts, allPosts, searchQuery, filterType, loading, performSearch, clearSearch, changeFilter, debouncedSearch, getPostsByWriter, getPostById, getLatestPosts, getTrendingPosts]);

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};