// client/src/components/common/Navbar.jsx (Ultimate Version)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../assets/assets';
import { useBlog } from '../context/BlogContext';
import { useUser } from '../context/UserContext';
import profileService from '../services/profileService';

const Navbar = () => {
  const { performSearch, searchQuery, clearSearch } = useBlog();
  const { user, isAuthenticated, logout } = useUser();
  const [searchQueryLocal, setSearchQueryLocal] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch profile avatar when user is authenticated
  useEffect(() => {
    const fetchProfileAvatar = async () => {
      if (isAuthenticated && user) {
        setProfileLoading(true);
        try {
          const response = await profileService.getMyProfile();
          if (response.success && response.data.avatar) {
            setProfileAvatar(response.data.avatar);
          }
        } catch (error) {
          console.error('Error fetching profile avatar:', error);
          // Fallback to user.avatar if available
          if (user.avatar) {
            setProfileAvatar(user.avatar);
          }
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchProfileAvatar();
  }, [isAuthenticated, user]);

  // Sync local search query with context
  useEffect(() => {
    setSearchQueryLocal(searchQuery);
  }, [searchQuery]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQueryLocal.trim()) {
      performSearch(searchQueryLocal);
      
      if (location.pathname !== '/') {
        navigate('#blog');
      }
      
      setTimeout(() => {
        const blogSection = document.getElementById('blog');
        if (blogSection) {
          blogSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
      
      setIsMobileMenuOpen(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQueryLocal('');
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

  const handleLogoClick = () => {
    clearSearch();
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get avatar URL (priority: profile avatar > user avatar > null)
  const getAvatarUrl = () => {
    if (profileAvatar) return profileAvatar;
    if (user?.avatar) return user.avatar;
    return null;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Logo - Extreme Left */}
            <Link to="/" onClick={handleLogoClick} className="flex items-center flex-shrink-0 group">
              <div className="w-16 h-16 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                <img 
                  src={Logo} 
                  alt="ThoughtNest" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                ThoughtNest
              </span>
            </Link>

            {/* Search - Desktop - Centered */}
            <div className="hidden md:block flex-1 max-w-2xl mx-auto px-8">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQueryLocal}
                    onChange={(e) => setSearchQueryLocal(e.target.value)}
                    className="w-full px-5 py-2 pl-11 pr-20 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 text-sm bg-gray-50 hover:bg-white transition-all duration-200"
                  />
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"/>
                  </svg>
                  {searchQueryLocal && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors border-l border-gray-200 ml-2"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Desktop Actions - Conditional based on auth */}
           <div className="hidden md:flex items-center gap-4">
  {isAuthenticated && user ? (
    // Logged in - Show user profile menu
    <div className="relative user-menu">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?background=1e293b&color=fff&size=100&name=${user.name}`;
              }}
            />
          ) : (
            <span className="text-sm font-medium">
              {getUserInitials()}
            </span>
          )}
        </div>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-fadeIn">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <Link
            to="/profile"
            onClick={() => setShowUserMenu(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Profile
          </Link>
          <Link
            to="/myblogs"
            onClick={() => setShowUserMenu(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            My Blogs
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  ) : (
    // Not logged in - Show login/signup buttons
    <>
      <Link 
        to="/login" 
        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
      >
        Log in
      </Link>
      <Link to="/signup">
        <button className="px-5 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-colors shadow-sm">
          Sign up
        </button>
      </Link>
    </>
  )}
</div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 -mr-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus:outline-none transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Section */}
          <div className="md:hidden">
            {/* Search Bar - Mobile - Same design as desktop */}
            <div className="py-3 border-t border-gray-100">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQueryLocal}
                    onChange={(e) => setSearchQueryLocal(e.target.value)}
                    className="w-full px-5 py-2 pl-11 pr-20 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 text-sm bg-gray-50 hover:bg-white transition-all duration-200"
                  />
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"/>
                  </svg>
                  {searchQueryLocal && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors border-l border-gray-200 ml-2"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="py-4 border-t border-gray-100 animate-slideDown">
                {isAuthenticated && user ? (
                  // Mobile - Logged in view with avatar
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getUserInitials()
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link
                      to="/myblogs"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      My Blogs
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                ) : (
                  // Mobile - Not logged in view
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-3 text-center text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-3 text-center text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Active Search Indicator Bar */}

    </>
  );
};

export default Navbar;