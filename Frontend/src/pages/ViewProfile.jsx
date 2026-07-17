import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import profileService from '../services/profileService';
import { getProfilePath } from '../utils/profileRoutes';

const ViewProfile = () => {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      if (!userId) {
        setError('Invalid profile URL.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const profileResponse = await profileService.getProfileByUserId(userId);

        if (!profileResponse?.success || !profileResponse?.data) {
          setError('User not found.');
          setProfile(null);
          setPosts([]);
          return;
        }

        setProfile(profileResponse.data);

        const postsResponse = await axiosInstance.get('/blogs', {
          params: {
            author: userId,
            status: 'published',
            sortBy: 'createdAt',
            sortOrder: 'desc',
            limit: 20,
          },
        });

        if (postsResponse.data?.success) {
          setPosts(Array.isArray(postsResponse.data.data) ? postsResponse.data.data : []);
        } else {
          setPosts([]);
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          setError('User not found.');
        } else if (status === 400) {
          setError('Invalid user profile.');
        } else {
          setError('Unable to load profile right now.');
        }
        setProfile(null);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPosts();
  }, [userId]);

  const fullName = useMemo(() => {
    if (profile?.name?.trim()) return profile.name;
    return 'Unknown User';
  }, [profile]);

  const username = useMemo(() => {
    if (profile?.username?.trim()) return `@${profile.username.replace(/^@/, '')}`;
    return null;
  }, [profile]);

  const bio = profile?.bio?.trim() || 'This user has not added a bio yet.';
  const coverImage = profile?.coverImage;
  const avatar = profile?.avatar;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-56 md:h-72 bg-gradient-to-r from-gray-800 to-gray-900 animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="-mt-16 md:-mt-20">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white bg-gray-200 animate-pulse" />
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-full max-w-2xl bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center bg-white border border-gray-100 shadow-sm rounded-2xl p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-7.938 4h15.876c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L2.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Profile unavailable</h1>
          <p className="text-gray-600 mb-6">{error || 'This profile could not be loaded.'}</p>
          <Link to="/" className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="relative h-56 md:h-72 bg-gradient-to-r from-gray-800 to-gray-900 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`${fullName} cover`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : null}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 md:-mt-20">
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
            {avatar ? (
              <img
                src={avatar}
                alt={fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?background=1e293b&color=fff&size=180&name=${fullName}`;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center text-4xl font-bold">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <section className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
          {username && <p className="text-gray-500 mt-1">{username}</p>}
          <p className="text-gray-700 mt-4 leading-relaxed">{bio}</p>
        </section>

        <section className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-gray-900">Posts</h2>
            <span className="text-sm text-gray-500">{posts.length} total</span>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
              No published posts yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  to={`/blog/${post._id}`}
                  className="block p-4 border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{post.title || 'Untitled post'}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                    {post.excerpt || 'No summary available for this post.'}
                  </p>
                  <div className="mt-3 text-xs text-gray-400">
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="mt-6">
          <Link to={getProfilePath()} className="text-sm text-gray-500 hover:text-gray-700">
            Back to your profile settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
