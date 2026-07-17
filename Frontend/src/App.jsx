// client/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './component/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import MyBlogs from './pages/Myblogs';
import Profile from './pages/Profile';
import ViewProfile from './pages/ViewProfile';
import Signup from './pages/Signup';
import Blog from './pages/Blog';
import GoogleCallback from './pages/Googlecallback';
import CreateBlog from './pages/CreateBlog';
import { Toaster } from 'react-hot-toast';
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
  position="top-right"
  toastOptions={{
    duration: 4000,
    style: {
      background: '#363636',
      color: '#fff',
    },
    success: {
      duration: 3000,
      iconTheme: {
        primary: '#22c55e',
        secondary: '#fff',
      },
    },
    error: {
      duration: 4000,
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
    },
  }}
/>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/myblogs" element={<MyBlogs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<ViewProfile />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="/callback" element={<GoogleCallback />} />
         <Route path="/create-blog" element={<CreateBlog />} />
      

      </Routes>
  
    </div>
  );
}

export default App;