// client/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './component/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import MyBlogs from './pages/MyBlogs';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import Blog from './pages/Blog';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/myblogs" element={<MyBlogs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/blog/:id" element={<Blog />} />

      </Routes>
      <Profile />
  
    </div>
  );
}

export default App;