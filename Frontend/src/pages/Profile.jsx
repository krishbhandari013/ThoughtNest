// // client/src/pages/Profile.jsx
// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useBlog } from '../context/BlogContext';
// import BlogCard from '../component/BlogCard';

// const Profile = () => {
//   const navigate = useNavigate();
//   const { posts, getPostsByWriter } = useBlog();
//   const [user, setUser] = useState(null);
//   const [userPosts, setUserPosts] = useState([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [activeTab, setActiveTab] = useState('posts'); // posts, saved, settings
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     bio: '',
//     avatar: '',
//     location: '',
//     website: '',
//     twitter: '',
//     github: ''
//   });

//   useEffect(() => {
//     // Get user from localStorage
//     const storedUser = JSON.parse(localStorage.getItem('user'));
    
//     if (!storedUser) {
//       navigate('/login');
//       return;
//     }

//     setUser(storedUser);
//     setFormData({
//       name: storedUser.name || '',
//       email: storedUser.email || '',
//       bio: storedUser.bio || '',
//       avatar: storedUser.avatar || '',
//       location: storedUser.location || '',
//       website: storedUser.website || '',
//       twitter: storedUser.twitter || '',
//       github: storedUser.github || ''
//     });

//     // Get user's posts
//     const usersPosts = getPostsByWriter(storedUser.name);
//     setUserPosts(usersPosts);
//   }, [navigate, getPostsByWriter]);

//   const handleSave = () => {
//     const updatedUser = { ...user, ...formData };
//     setUser(updatedUser);
//     localStorage.setItem('user', JSON.stringify(updatedUser));
//     setIsEditing(false);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/login');
//   };

//   if (!user) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Profile Header */}
//       <div className="relative">
//         {/* Cover Image */}
//         <div className="h-48 md:h-64 bg-gradient-to-r from-gray-800 to-gray-900"></div>
        
//         {/* Profile Info */}
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="relative -mt-16 sm:-mt-20 md:-mt-24">
//             {/* Avatar */}
//             <div className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-6">
//               <div className="relative">
//                 <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white p-1 shadow-xl">
//                   {formData.avatar || user.avatar ? (
//                     <img 
//                       src={formData.avatar || user.avatar} 
//                       alt={user.name}
//                       className="w-full h-full rounded-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
//                       <span className="text-3xl md:text-4xl font-bold text-white">
//                         {user.name.charAt(0).toUpperCase()}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//                 {isEditing && (
//                   <button className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 rounded-full shadow-lg hover:bg-gray-800 transition-colors">
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
//                     </svg>
//                   </button>
//                 )}
//               </div>
              
//               <div className="text-center md:text-left flex-1">
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     className="text-2xl md:text-3xl font-bold text-gray-900 bg-gray-100 border border-gray-300 rounded-lg px-3 py-1"
//                   />
//                 ) : (
//                   <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.name}</h1>
//                 )}
//                 <p className="text-gray-500 mt-1">{user.email}</p>
//                 {formData.location && !isEditing && (
//                   <p className="text-sm text-gray-400 mt-1 flex items-center justify-center md:justify-start gap-1">
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                     </svg>
//                     {formData.location}
//                   </p>
//                 )}
//               </div>
              
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setIsEditing(!isEditing)}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   {isEditing ? 'Cancel' : 'Edit Profile'}
//                 </button>
//                 <button
//                   onClick={handleLogout}
//                   className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
//                 >
//                   Logout
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="border-b border-gray-200 bg-white mt-6">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex gap-8">
//             <button
//               onClick={() => setActiveTab('posts')}
//               className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
//                 activeTab === 'posts'
//                   ? 'border-gray-900 text-gray-900'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               My Posts ({userPosts.length})
//             </button>
//             <button
//               onClick={() => setActiveTab('saved')}
//               className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
//                 activeTab === 'saved'
//                   ? 'border-gray-900 text-gray-900'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               Saved
//             </button>
//             <button
//               onClick={() => setActiveTab('settings')}
//               className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
//                 activeTab === 'settings'
//                   ? 'border-gray-900 text-gray-900'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               Settings
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* My Posts Tab */}
//         {activeTab === 'posts' && (
//           <div>
//             {userPosts.length === 0 ? (
//               <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
//                 <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
//                 </svg>
//                 <h3 className="text-lg font-medium text-gray-900 mb-1">No posts yet</h3>
//                 <p className="text-gray-500 mb-4">Start writing your first blog post</p>
//                 <Link to="/create-blog">
//                   <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
//                     Create New Post
//                   </button>
//                 </Link>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {userPosts.map((post) => (
//                   <BlogCard key={post.id} post={post} />
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Saved Tab */}
//         {activeTab === 'saved' && (
//           <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
//             <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
//             </svg>
//             <h3 className="text-lg font-medium text-gray-900 mb-1">Saved posts</h3>
//             <p className="text-gray-500">Posts you save will appear here</p>
//           </div>
//         )}

//         {/* Settings Tab */}
//         {activeTab === 'settings' && (
//           <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
//             <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
            
//             {isEditing ? (
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                   <input
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
//                   <textarea
//                     rows="4"
//                     value={formData.bio}
//                     onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
//                     placeholder="Tell us about yourself..."
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
//                   <input
//                     type="text"
//                     value={formData.avatar}
//                     onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
//                     placeholder="https://example.com/avatar.jpg"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
//                   <input
//                     type="text"
//                     value={formData.location}
//                     onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
//                     placeholder="City, Country"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
//                   <input
//                     type="url"
//                     value={formData.website}
//                     onChange={(e) => setFormData({ ...formData, website: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
//                     placeholder="https://yourwebsite.com"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
//                   <input
//                     type="text"
//                     value={formData.twitter}
//                     onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
//                     placeholder="@username"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
//                   <input
//                     type="text"
//                     value={formData.github}
//                     onChange={(e) => setFormData({ ...formData, github: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
//                     placeholder="username"
//                   />
//                 </div>
                
//                 <div className="flex gap-3 pt-4">
//                   <button
//                     onClick={handleSave}
//                     className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
//                   >
//                     Save Changes
//                   </button>
//                   <button
//                     onClick={() => setIsEditing(false)}
//                     className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {formData.bio && (
//                   <div>
//                     <h3 className="text-sm font-medium text-gray-500 mb-1">Bio</h3>
//                     <p className="text-gray-900">{formData.bio}</p>
//                   </div>
//                 )}
                
//                 {formData.location && (
//                   <div>
//                     <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
//                     <p className="text-gray-900">{formData.location}</p>
//                   </div>
//                 )}
                
//                 {formData.website && (
//                   <div>
//                     <h3 className="text-sm font-medium text-gray-500 mb-1">Website</h3>
//                     <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline">
//                       {formData.website}
//                     </a>
//                   </div>
//                 )}
                
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500 mb-1">Social</h3>
//                   <div className="flex gap-4">
//                     {formData.twitter && (
//                       <a href={`https://twitter.com/${formData.twitter}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
//                         Twitter
//                       </a>
//                     )}
//                     {formData.github && (
//                       <a href={`https://github.com/${formData.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
//                         GitHub
//                       </a>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="pt-4">
//                   <button
//                     onClick={() => setIsEditing(true)}
//                     className="text-sm text-gray-600 hover:text-gray-900"
//                   >
//                     Edit Profile →
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Profile;
import React from 'react'

const Profile = () => {
  return (
    <div>
      helo
    </div>
  )
}

export default Profile
