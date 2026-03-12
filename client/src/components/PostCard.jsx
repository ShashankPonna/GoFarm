import React, { useState } from 'react';
import { postsAPI } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const PostCard = ({ post, onPostUpdate }) => {
  const { user } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    try {
      setIsLiking(true);
      const response = await postsAPI.like(post._id);
      onPostUpdate(response.data);
      
      const isLiked = response.data.likes.includes(user._id);
      toast.success(isLiked ? 'Post liked!' : 'Like removed');
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isCommenting) return;

    try {
      setIsCommenting(true);
      const response = await postsAPI.comment(post._id, newComment);
      onPostUpdate(response.data);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error commenting:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Tips': return 'bg-blue-100 text-blue-800';
      case 'Question': return 'bg-yellow-100 text-yellow-800';
      case 'Success Story': return 'bg-green-100 text-green-800';
      case 'Discussion': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Tips': return 'fa-lightbulb';
      case 'Question': return 'fa-question-circle';
      case 'Success Story': return 'fa-trophy';
      case 'Discussion': return 'fa-comments';
      default: return 'fa-comment';
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return postDate.toLocaleDateString();
  };

  const isLiked = post.likes?.includes(user?._id);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {post.author?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{post.author?.name || 'Unknown User'}</h4>
              <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
            <i className={`fas ${getCategoryIcon(post.category)} mr-1`}></i>
            {post.category}
          </span>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <p className="text-gray-800 leading-relaxed mb-4">{post.content}</p>
        
        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {post.images.map((image, index) => {
              // Check if image.url is already a full URL (Cloudinary) or local path
              const imageUrl = image.url.startsWith('http') 
                ? image.url 
                : `http://localhost:5000${image.url}`;
              
              return (
                <img
                  key={index}
                  src={imageUrl}
                  alt="gallery-item"
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    // Only fallback once to prevent infinite loops
                    if (!e.target.dataset.fallbackAttempted) {
                      e.target.dataset.fallbackAttempted = 'true';
                      e.target.src = 'http://localhost:5000/image/post1.jpeg';
                    }
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <i className={`fas fa-heart ${isLiking ? 'animate-pulse' : ''}`}></i>
              <span className="text-sm font-medium">{post.likes?.length || 0}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <i className="fas fa-comment"></i>
              <span className="text-sm font-medium">{post.comments?.length || 0}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
              <i className="fas fa-share"></i>
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100">
          {/* Existing Comments */}
          {post.comments && post.comments.length > 0 && (
            <div className="max-h-60 overflow-y-auto">
              {post.comments.map((comment, index) => (
                <div key={index} className="p-4 border-b border-gray-50 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="font-semibold text-sm text-gray-800">{comment.user?.name || 'Unknown User'}</h5>
                        <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <form onSubmit={handleComment} className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isCommenting}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  {isCommenting ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-paper-plane"></i>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;