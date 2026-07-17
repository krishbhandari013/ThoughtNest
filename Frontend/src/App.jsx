import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './component/Navbar';
import { Toaster } from 'react-hot-toast';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const MyBlogs = lazy(() => import('./pages/MyBlogs.jsx'));
const Profile = lazy(() => import('./pages/Profile'));
const ViewProfile = lazy(() => import('./pages/ViewProfile'));
const Signup = lazy(() => import('./pages/Signup'));
const Blog = lazy(() => import('./pages/Blog'));
const GoogleCallback = lazy(() => import('./pages/Googlecallback'));
const CreateBlog = lazy(() => import('./pages/CreateBlog'));

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
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
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
      </Suspense>
    </div>
  );
}

export default App;