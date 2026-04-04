// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { BlogProvider } from './context/BlogContext';
import './index.css';
import { UserProvider } from './context/UserContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter> 
  <UserProvider> {/* ✅ BrowserRouter must be FIRST */}
    <BlogProvider>
     
        <App />
      
    </BlogProvider>
    </UserProvider>
  </BrowserRouter>
);