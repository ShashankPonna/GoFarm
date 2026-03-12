import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { wasteProductsAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const WasteManagement = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const [wasteItems, setWasteItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWaste, setNewWaste] = useState({
    name: '',
    description: '',
    category: 'Organic',
    price: '',
    unit: 'kg',
    quantity: '',
    image: ''
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const categories = ['All', 'Organic', 'Oils', 'Vegetables', 'Fruits', 'Mulch', 'Fertilizer', 'Other'];

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchWasteProducts();
    }
  }, [isAuthenticated, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchWasteProducts = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated || !user?._id) {
        console.log('❌ User not authenticated for waste products');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Fetching waste products for user:', user._id);
      const response = await wasteProductsAPI.getMyProducts();
      console.log('📦 Waste products response:', response.data);
      setWasteItems(response.data.wasteProducts || []);
    } catch (error) {
      console.error('❌ Error fetching waste products:', error);
      toast.error(t('wasteManagement.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const filteredWaste = selectedCategory === 'All' 
    ? wasteItems 
    : wasteItems.filter(item => item.category === selectedCategory);

  const handleDeleteWaste = async (id) => {
    if (window.confirm(t('wasteManagement.deleteConfirm'))) {
      try {
        await wasteProductsAPI.delete(id);
        setWasteItems(wasteItems.filter(w => w._id !== id));
        toast.success(t('wasteManagement.deletedSuccess'));
      } catch (error) {
        console.error('Error deleting waste product:', error);
        toast.error(t('wasteManagement.deleteFailed'));
      }
    }
  };

  const handleEditWaste = (waste) => {
    alert(t('wasteManagement.editComing', { name: waste.name }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        toast.error(t('wasteManagement.invalidImage', { name: file.name }));
      }
      return isValid;
    });

    if (validFiles.length + selectedImages.length > 10) {
      toast.error(t('wasteManagement.maxImages'));
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

  // Handle video selection
  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('video/');
      if (!isValid) {
        toast.error(t('wasteManagement.invalidVideo', { name: file.name }));
      }
      return isValid;
    });

    if (validFiles.length + selectedVideos.length > 5) {
      toast.error(t('wasteManagement.maxVideos'));
      return;
    }

    setSelectedVideos([...selectedVideos, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // Remove video
  const removeVideo = (index) => {
    setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
    setVideoPreviews(videoPreviews.filter((_, i) => i !== index));
  };

  const handleAddWaste = async (e) => {
    e.preventDefault();
    
    if (!newWaste.name || !newWaste.price || !newWaste.quantity) {
      toast.error(t('wasteManagement.fillRequired'));
      return;
    }

    if (selectedImages.length === 0) {
      toast.error(t('wasteManagement.uploadImage'));
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('name', newWaste.name);
      formData.append('description', newWaste.description);
      formData.append('category', newWaste.category);
      formData.append('price', parseFloat(newWaste.price));
      formData.append('unit', newWaste.unit);
      formData.append('quantity', parseInt(newWaste.quantity));

      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      selectedVideos.forEach((video) => {
        formData.append('videos', video);
      });

      const response = await wasteProductsAPI.create(formData);

      setWasteItems([...wasteItems, response.data.wasteProduct]);
      setShowAddForm(false);
      setNewWaste({
        name: '',
        description: '',
        category: 'Organic',
        price: '',
        unit: 'kg',
        quantity: '',
        image: ''
      });
      setSelectedImages([]);
      setSelectedVideos([]);
      setImagePreviews([]);
      setVideoPreviews([]);
      toast.success(t('wasteManagement.addedSuccess'));
    } catch (error) {
      console.error('Error adding waste product:', error);
      toast.error(t('wasteManagement.addFailed'));
    } finally {
      setUploading(false);
    }
  };



  const getCategoryColor = (category) => {
    switch (category) {
      case 'Organic': return 'bg-green-100 text-green-800';
      case 'Oils': return 'bg-orange-100 text-orange-800';
      case 'Vegetables': return 'bg-green-100 text-green-800';
      case 'Fruits': return 'bg-red-100 text-red-800';
      case 'Mulch': return 'bg-yellow-100 text-yellow-800';
      case 'Fertilizer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Authentication check
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-user-slash text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-600 mb-2">{t('wasteManagement.authRequired')}</h3>
          <p className="text-gray-500">{t('wasteManagement.pleaseLogin')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => window.history.back()} className="mr-4">
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <div>
              <h1 className="text-xl font-bold">♻️ {t('wasteManagement.title')}</h1>
              <p className="text-sm text-green-200">{t('wasteManagement.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <i className="fas fa-plus mr-2"></i>
            {t('wasteManagement.addWasteProduct')}
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('wasteManagement.wasteProducts')}</p>
                <p className="text-2xl font-bold text-gray-800">{wasteItems.length}</p>
              </div>
              <i className="fas fa-recycle text-3xl text-green-500"></i>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('wasteManagement.organic')}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {wasteItems.filter(w => w.category === 'Organic').length}
                </p>
              </div>
              <i className="fas fa-leaf text-3xl text-green-500"></i>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('wasteManagement.avgPrice')}</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{wasteItems.length > 0 ? Math.round(wasteItems.reduce((sum, w) => sum + (Number(w.price) || 0), 0) / wasteItems.length) : 0}
                </p>
              </div>
              <i className="fas fa-tag text-3xl text-blue-500"></i>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('wasteManagement.totalWaste')}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {wasteItems.reduce((sum, w) => sum + (Number(w.quantity) || 0), 0)}
                </p>
              </div>
              <i className="fas fa-boxes text-3xl text-purple-500"></i>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-green-600 mb-4"></i>
            <p className="text-gray-600">{t('wasteManagement.loadingProducts')}</p>
          </div>
        ) : (
          <>
            {/* Waste Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWaste.map(waste => (
            <div 
              key={waste._id} 
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="h-48 bg-gray-200 overflow-hidden">
                {waste.images && waste.images[0] ? (
                  <img 
                    src={`http://localhost:5000${waste.images[0].url}`}
                    alt={waste.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'http://localhost:5000/image/weast.jpg';
                    }}
                  />
                ) : waste.image ? (
                  <img 
                    src={waste.image} 
                    alt={waste.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'http://localhost:5000/image/weast.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fas fa-image text-4xl text-gray-400"></i>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{waste.name || 'Unnamed Product'}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(waste.category)}`}>
                    {waste.category || 'Other'}
                  </span>
                </div>
                <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{waste.description || 'No description'}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('wasteManagement.price')}:</span>
                    <span className="font-bold text-green-600">₹{waste.price || 0}/{waste.unit || 'unit'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('wasteManagement.available')}:</span>
                    <span className="font-medium">{waste.quantity || 0} {waste.unit || 'unit'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('wasteManagement.seller')}:</span>
                    <span className="font-medium text-blue-600">
                      {typeof waste.seller === 'object' ? waste.seller?.name || 'Unknown' : waste.seller || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditWaste(waste)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors duration-300"
                  >
                    <i className="fas fa-edit mr-1"></i>
                    {t('wasteManagement.edit')}
                  </button>
                  <button 
                    onClick={() => handleDeleteWaste(waste._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors duration-300"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    {t('wasteManagement.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
            </div>

            {filteredWaste.length === 0 && !loading && (
              <div className="text-center py-12">
                <i className="fas fa-recycle text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-medium text-gray-600 mb-2">{t('wasteManagement.noProductsFound')}</h3>
                <p className="text-gray-500">{t('wasteManagement.startConverting')}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Waste Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">♻️ {t('wasteManagement.addWasteTitle')}</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={handleAddWaste} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('wasteManagement.wasteProductName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newWaste.name}
                    onChange={(e) => setNewWaste({...newWaste, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={t('wasteManagement.namePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('wasteManagement.wasteCategory')}</label>
                  <select
                    value={newWaste.category}
                    onChange={(e) => setNewWaste({...newWaste, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Organic">Organic</option>
                    <option value="Oils">Oils</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Mulch">Mulch</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('wasteManagement.price')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={newWaste.price}
                      onChange={(e) => setNewWaste({...newWaste, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="₹"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('wasteManagement.unit')}</label>
                    <select
                      value={newWaste.unit}
                      onChange={(e) => setNewWaste({...newWaste, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="bag">bag</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('wasteManagement.quantity')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newWaste.quantity}
                    onChange={(e) => setNewWaste({...newWaste, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Available quantity"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-images mr-2 text-blue-600"></i>
                    {t('wasteManagement.wasteProductImages')} <span className="text-red-500">*</span> (Max 10)
                  </label>
                  <input 
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full border-2 border-dashed border-gray-300 p-3 rounded-lg cursor-pointer hover:border-green-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('wasteManagement.supportedImages')}</p>
                  
                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-video mr-2 text-red-600"></i>
                    {t('wasteManagement.wasteProductVideos')} (Optional, Max 5)
                  </label>
                  <input 
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoChange}
                    className="w-full border-2 border-dashed border-gray-300 p-3 rounded-lg cursor-pointer hover:border-green-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('wasteManagement.supportedVideos')}</p>
                  
                  {/* Video Previews */}
                  {videoPreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {videoPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <video 
                            src={preview}
                            className="w-full h-24 object-cover rounded-lg"
                            controls
                          />
                          <button
                            type="button"
                            onClick={() => removeVideo(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('wasteManagement.description')}</label>
                  <textarea
                    value={newWaste.description}
                    onChange={(e) => setNewWaste({...newWaste, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical"
                    rows="3"
                    placeholder={t('wasteManagement.descriptionPlaceholder')}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {t('wasteManagement.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        {t('wasteManagement.uploading')}
                      </>
                    ) : (
                      t('wasteManagement.addWasteProduct')
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteManagement;
