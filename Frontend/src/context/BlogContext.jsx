// client/src/context/BlogContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { blogPosts } from '../assets/assets';

// Create Context
const BlogContext = createContext();

// Custom hook to use blog context
export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within BlogProvider');
  }
  return context;
};

// Blog Provider Component
export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  // Load initial blog posts
  useEffect(() => {
    setPosts(blogPosts);
  }, []);

  const value = {
    posts
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};