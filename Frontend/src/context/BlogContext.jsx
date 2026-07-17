// client/src/context/BlogContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axiosInstance from '../services/axiosInstance';

const BlogContext = createContext();

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within BlogProvider');
  }
  return context;
};

export const BlogProvider = ({ children }) => {
  const [allPosts, setAllPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, pages: 1 });
  
  // Use ref to prevent unnecessary re-renders
  const searchTimeoutRef = useRef(null);
  const previousSearchQuery = useRef('');
  const previousFilterType = useRef('all');

  // Fetch blogs from backend API
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {
        status: 'published',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: pagination.limit,
        page: pagination.page
      };
      
      // Add category filter
      if (filterType && filterType !== 'all') {
        params.category = filterType;
      }
      
      // Add search query
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      const response = await axiosInstance.get('/blogs', { params });
      
      if (response.data.success) {
        setAllPosts(response.data.data);
        setTotalPosts(response.data.pagination?.total || 0);
        setPagination(prev => ({
          ...prev,
          pages: response.data.pagination?.pages || 1,
          total: response.data.pagination?.total || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setAllPosts([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, searchQuery, pagination.page, pagination.limit]);

  // Load blogs when filter or search changes
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Get posts by writer name
  const getPostsByWriter = useCallback(async (writerName) => {
    try {
      const response = await axiosInstance.get('/blogs', {
        params: {
          authorName: writerName,
          status: 'published',
          limit: 50
        }
      });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching posts by writer:', error);
      return [];
    }
  }, []);

  // Get post by ID
  const getPostById = useCallback(async (id) => {
    try {
      const response = await axiosInstance.get(`/blogs/${id}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      return null;
    }
  }, []);

  // Get latest posts
  const getLatestPosts = useCallback(async (limit = 6) => {
    try {
      const response = await axiosInstance.get('/blogs', {
        params: {
          status: 'published',
          sortBy: 'createdAt',
          sortOrder: 'desc',
          limit
        }
      });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching latest posts:', error);
      return [];
    }
  }, []);

  // Get trending posts (based on views and likes)
  const getTrendingPosts = useCallback(async (limit = 4) => {
    try {
      const response = await axiosInstance.get('/blogs', {
        params: {
          status: 'published',
          sortBy: 'views',
          sortOrder: 'desc',
          limit
        }
      });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      return [];
    }
  }, []);

  // Get popular posts (based on likes)
  const getPopularPosts = useCallback(async (limit = 5) => {
    try {
      const response = await axiosInstance.get('/blogs', {
        params: {
          status: 'published',
          sortBy: 'likesCount',
          sortOrder: 'desc',
          limit
        }
      });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching popular posts:', error);
      return [];
    }
  }, []);

  // Get all unique categories from blogs
  const getAllCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/blogs/categories');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return ['Technology', 'Web Development', 'JavaScript', 'React', 'Node.js', 'Design', 'Career', 'AI & ML'];
    }
  }, []);

  const performSearch = useCallback((query) => {
    if (query === previousSearchQuery.current) return;
    previousSearchQuery.current = query;
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new search
  }, []);

  const clearSearch = useCallback(() => {
    if (previousSearchQuery.current === '') return;
    previousSearchQuery.current = '';
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const changeFilter = useCallback((filter) => {
    if (filter === previousFilterType.current) return;
    previousFilterType.current = filter;
    setFilterType(filter);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  }, []);

  const clearFilters = useCallback(() => {
    setFilterType('all');
    setSearchQuery('');
    previousFilterType.current = 'all';
    previousSearchQuery.current = '';
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const debouncedSearch = useCallback((query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  }, [performSearch]);

  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const value = useMemo(() => ({
    posts: allPosts,
    allPosts,
    searchQuery,
    filterType,
    loading,
    totalPosts,
    pagination,
    performSearch,
    clearSearch,
    changeFilter,
    clearFilters,
    debouncedSearch,
    getPostsByWriter,
    getPostById,
    getLatestPosts,
    getTrendingPosts,
    getPopularPosts,
    getAllCategories,
    goToPage,
    fetchBlogs
  }), [allPosts, searchQuery, filterType, loading, totalPosts, pagination, 
      performSearch, clearSearch, changeFilter, clearFilters, debouncedSearch,
      getPostsByWriter, getPostById, getLatestPosts, getTrendingPosts, 
      getPopularPosts, getAllCategories, goToPage, fetchBlogs]);

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};