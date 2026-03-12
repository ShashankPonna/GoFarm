import React, { useState } from 'react';
import { postsAPI } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [postData, setPostData] = useState({
    content: '',
    category: 'Discussion'
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'Discussion', label: 'Discussion', icon: 'fa-comments', color: 'purple' },
    { value: 'Tips', label: 'Tips & Advice', icon: 'fa-lightbulb', color: 'blue' },
    { value: 'Question', label: 'Question', icon: 'fa-question-circle', color: 'yellow' },
    { value: 'Success Story', label: 'Success Story', icon: 'fa-trophy', color: 'green' }
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        toast.error(`${file.name} is not a valid image file`);
      }
      return isValid;
    });

    if (validFiles.length + selectedImages.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }

    setSelectedImages([...selectedImages, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!postData.content.trim()) {
      toast.error('Please write something to post');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('content', postData.content);
      formData.append('category', postData.category);

      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      console.log('📤 Submitting post with', selectedImages.length, 'images...');
      const response = await postsAPI.create(formData);
      
      console.log('✅ Post created successfully:', response.data);
      
      if (onPostCreated) {
        onPostCreated(response.data.post || response.data);
      }
      
      // Reset form
      setPostData({ content: '', category: 'Discussion' });
      setSelectedImages([]);
      setImagePreviews([]);
      setShowForm(false);
      
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('❌ Error creating post:', error);
      
      // Display specific error message from server
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create post';
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (color) => {
    const colors = {
      purple: 'border-purple-500 text-purple-600 bg-purple-50',
      blue: 'border-blue-500 text-blue-600 bg-blue-50',
      yellow: 'border-yellow-500 text-yellow-600 bg-yellow-50',
      green: 'border-green-500 text-green-600 bg-green-50'
    };
    return colors[color] || colors.purple;
  };

  if (!showForm) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-left px-4 py-3 rounded-full transition-colors"
          >
            What's on your mind, {user?.name?.split(' ')[0] || 'there'}?
          </button>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <i className="fas fa-image text-green-500"></i>
            <span className="text-sm font-medium">Photo</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 text-gray-600 hover:text-yellow-600 transition-colors"
          >
            <i className="fas fa-question-circle text-yellow-500"></i>
            <span className="text-sm font-medium">Ask Question</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <i className="fas fa-lightbulb text-blue-500"></i>
            <span className="text-sm font-medium">Share Tip</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Create Post</h3>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setPostData({ ...postData, category: category.value })}
                className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                  postData.category === category.value
                    ? getCategoryColor(category.color)
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <i className={`fas ${category.icon} mr-2`}></i>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <textarea
            value={postData.content}
            onChange={(e) => setPostData({ ...postData, content: e.target.value })}
            placeholder="Share your thoughts, ask questions, or give advice to the community..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            rows="4"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-images mr-2 text-blue-600"></i>
            Add Images (Optional, Max 4)
          </label>
          <input 
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full border-2 border-dashed border-gray-300 p-3 rounded-lg cursor-pointer hover:border-blue-500 text-sm"
          />
          
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !postData.content.trim()}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Posting...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane mr-2"></i>
                Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;