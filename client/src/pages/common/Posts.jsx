import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { postsAPI } from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import PostCard from '../../components/PostCard';
import CreatePost from '../../components/CreatePost';
import toast from 'react-hot-toast';

const Posts = () => {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Set page title
  useEffect(() => {
    document.title = `${t('navigation.posts')} - GOFaRm`;
    return () => {
      document.title = 'GOFaRm - Agricultural Marketplace';
    };
  }, [t]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = activeFilter !== 'all' ? { category: activeFilter } : {};
      const response = await postsAPI.getAll(params);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (socket && typeof socket.on === 'function') {
      socket.on('newPost', (newPost) => {
        setPosts(prev => [newPost, ...prev]);
        toast.success('New post added!');
      });

      socket.on('postLiked', ({ postId, likes }) => {
        setPosts(prev => prev.map(post => 
          post._id === postId ? { ...post, likes } : post
        ));
      });

      socket.on('postCommented', ({ postId, comments }) => {
        setPosts(prev => prev.map(post => 
          post._id === postId ? { ...post, comments } : post
        ));
      });

      return () => {
        if (socket && typeof socket.off === 'function') {
          socket.off('newPost');
          socket.off('postLiked');
          socket.off('postCommented');
        }
      };
    }
  }, [socket]);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  // Filter posts based on active filter
  const filteredPosts = activeFilter === 'all' 
    ? posts 
    : posts.filter(post => post.category === activeFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button onClick={() => window.history.back()} className="mr-4">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold">Posts</h1>
            <p className="text-sm text-green-200">Share and discover content</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-10 px-4 pb-24">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            Posts
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share knowledge and connect with farmers and retailers
          </p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-6 text-center hover:scale-105 transition-transform">
            <i className="fas fa-users text-3xl text-green-600 mb-2"></i>
            <div className="text-2xl font-bold text-green-600">23,704</div>
            <div className="text-gray-600 text-sm">Active Users</div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-6 text-center hover:scale-105 transition-transform">
            <i className="fas fa-edit text-3xl text-blue-600 mb-2"></i>
            <div className="text-2xl font-bold text-blue-600">5,701</div>
            <div className="text-gray-600 text-sm">Total Posts</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl p-6 text-center hover:scale-105 transition-transform">
            <i className="fas fa-heart text-3xl text-yellow-600 mb-2"></i>
            <div className="text-2xl font-bold text-yellow-600">14,620</div>
            <div className="text-gray-600 text-sm">Likes Given</div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-6 text-center hover:scale-105 transition-transform">
            <i className="fas fa-comments text-3xl text-purple-600 mb-2"></i>
            <div className="text-2xl font-bold text-purple-600">2,468</div>
            <div className="text-gray-600 text-sm">Comments</div>
          </div>
        </div>

        {/* Create Post */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Filter */}
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                <i className="fas fa-filter text-white"></i>
              </div>
              Filter Posts
            </h2>
            <div className="flex space-x-2 flex-wrap gap-2">
              {['all', 'Tips', 'Question', 'Success Story', 'Discussion'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-sm ${
                    activeFilter === filter
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <i className={`fas ${
                    filter === 'all' ? 'fa-th-large' :
                    filter === 'Tips' ? 'fa-lightbulb' :
                    filter === 'Question' ? 'fa-question-circle' :
                    filter === 'Success Story' ? 'fa-trophy' :
                    'fa-comments'
                  } mr-2`}></i>
                  {filter === 'all' ? 'All Posts' : filter}
                </button>
              ))}
            </div>
          </div>
          
          {/* Active Filter Info */}
          {activeFilter !== 'all' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold text-green-600">{filteredPosts.length}</span> {activeFilter} posts
                </p>
                <button
                  onClick={() => setActiveFilter('all')}
                  className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center"
                >
                  <i className="fas fa-times-circle mr-1"></i>
                  Clear filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onPostUpdate={handlePostUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-lg p-8 max-w-md mx-auto">
              <i className="fas fa-edit text-5xl text-green-400 mb-4"></i>
              <p className="text-gray-600 text-lg mb-2">No posts found</p>
              <p className="text-gray-500 text-sm">
                {activeFilter === 'all' 
                  ? 'Be the first to share something! Both farmers and retailers can post here.' 
                  : `No ${activeFilter} posts yet. Try a different category or create one!`
                }
              </p>
              {activeFilter !== 'all' && (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="mt-4 text-green-600 hover:text-green-700 font-semibold"
                >
                  <i className="fas fa-redo mr-2"></i> View all posts
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-gray-200 z-50">
        <div className="flex justify-around py-3 max-w-lg mx-auto">
          <button 
            onClick={() => window.history.back()}
            className="flex flex-col items-center text-gray-500 hover:text-green-600 transition-all"
          >
            <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mb-1 hover:bg-green-50 transition">
              <i className="fas fa-home text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Home</span>
          </button>
          
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center text-green-600 transition-all"
          >
            <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center mb-1 scale-110">
              <i className="fas fa-edit text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Posts</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/chat'}
            className="flex flex-col items-center text-gray-500 hover:text-green-600 transition-all"
          >
            <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mb-1 hover:bg-green-50 transition">
              <i className="fas fa-comments text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Chat</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/profile'}
            className="flex flex-col items-center text-gray-500 hover:text-green-600 transition-all"
          >
            <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mb-1 hover:bg-green-50 transition">
              <i className="fas fa-user text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Account</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Posts;