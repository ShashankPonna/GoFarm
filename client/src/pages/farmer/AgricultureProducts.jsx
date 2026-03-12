import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { productsAPI, IMAGE_BASE_URL } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../context/SocketContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import toast from 'react-hot-toast';

const AgricultureProducts = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore(state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated
  }));
  const { socket } = useSocket();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'vegetables',
    price: '',
    unit: 'kg',
    quantity: '',
    organic: false,
    certified: false
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const categories = [
    t('common.all') || 'All',
    t('categories.vegetables'),
    t('categories.fruits'),
    t('categories.grainsSpices'),
    t('categories.millets') || 'Millets',
    t('categories.cereals') || 'Cereals',
    t('categories.pulses'),
    t('categories.spices'),
    t('categories.dairy'),
    t('categories.other')
  ];

  // Timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    console.log('🔄 useEffect triggered:', {
      isAuthenticated,
      userId: user?._id,
      userObject: user,
      timestamp: new Date().toISOString()
    });
    // Only fetch if user is authenticated and loaded
    if (isAuthenticated && user?._id) {
      console.log('✅ Calling fetchProducts with user ID:', user._id);
      fetchProducts();
    } else if (isAuthenticated === false) {
      // User is definitely not authenticated
      console.log('❌ User not authenticated');
      setLoading(false);
    } else {
      console.log('⏳ Waiting for auth state...');
    }
  }, [isAuthenticated, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for real-time product updates
  useEffect(() => {
    if (socket && socket.on && user?._id) {
      console.log('🔌 Setting up socket listeners for user:', user._id);

      const handleProductAdded = (product) => {
        console.log('📦 Product added event:', product);
        if (product.seller._id === user._id) {
          setProducts(prev => [product, ...prev]);
        }
      };

      const handleProductUpdated = (product) => {
        console.log('📝 Product updated event:', product);
        if (product.seller._id === user._id) {
          setProducts(prev => prev.map(p => p._id === product._id ? product : p));
        }
      };

      const handleProductDeleted = (productId) => {
        console.log('🗑️ Product deleted event:', productId);
        setProducts(prev => prev.filter(p => p._id !== productId));
      };

      socket.on('productAdded', handleProductAdded);
      socket.on('productUpdated', handleProductUpdated);
      socket.on('productDeleted', handleProductDeleted);

      return () => {
        if (socket && socket.off) {
          socket.off('productAdded', handleProductAdded);
          socket.off('productUpdated', handleProductUpdated);
          socket.off('productDeleted', handleProductDeleted);
        }
      };
    } else {
      console.log('🔌 Socket not ready:', { socket: !!socket, socketOn: !!(socket?.on), userId: user?._id });
    }
  }, [socket, user?._id]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      if (!isAuthenticated || !user?._id) {
        console.log('❌ Not authenticated or no user ID:', { isAuthenticated, userId: user?._id });
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching products for user:', user._id);
      console.log('🔍 Making API call to:', `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/products?seller=${user._id}`);

      const response = await productsAPI.getAll({ seller: user._id });
      console.log('📦 API Response status:', response.status);
      console.log('📦 API Response data:', response.data);
      console.log('📦 API Response headers:', response.headers);

      const products = response.data.products || [];
      console.log('✅ Setting products:', products.length, 'products');
      console.log('📦 Products array:', products);
      setProducts(products);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);

      if (error.response?.status === 401) {
        toast.error('Authentication failed - please log in again');
        // Clear invalid auth data
        useAuthStore.getState().logout();
      } else if (error.response?.status === 400) {
        toast.error('Invalid request - check user ID format');
      } else {
        toast.error(`Failed to load products: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);

        // Refresh the products list to remove the deleted product
        await fetchProducts();
        toast.success('Product deleted successfully!');
      } catch (error) {
        console.error('❌ Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleEditProduct = (product) => {
    toast.success(`Edit functionality for "${product.name}" - Coming soon!`);
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        toast.error(`${file.name} is not a valid image file`);
      }
      return isValid;
    });

    if (validFiles.length + selectedImages.length > 10) {
      toast.error('Maximum 10 images allowed');
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
        toast.error(`${file.name} is not a valid video file`);
      }
      return isValid;
    });

    if (validFiles.length + selectedVideos.length > 5) {
      toast.error('Maximum 5 videos allowed');
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

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedImages.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    try {
      setUploading(true);



      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('category', newProduct.category);
      formData.append('price', parseFloat(newProduct.price));
      formData.append('unit', newProduct.unit);
      formData.append('quantity', parseInt(newProduct.quantity));
      formData.append('organic', newProduct.organic);
      formData.append('certified', newProduct.certified);

      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      selectedVideos.forEach((video) => {
        formData.append('videos', video);
      });

      const response = await productsAPI.create(formData);

      // Add the new product directly to the state for immediate UI update
      if (response.data.product) {
        setProducts(prev => [response.data.product, ...prev]);
        console.log('✅ Product added to state immediately');
      }

      // Refresh the list to ensure consistency with server
      setTimeout(async () => {
        try {
          await fetchProducts();
          console.log('✅ Product list refreshed from server');
        } catch (error) {
          console.error('Error refreshing products:', error);
          // If refresh fails, at least we have the product in state from direct addition
        }
      }, 500);

      setShowAddForm(false);
      setNewProduct({
        name: '',
        description: '',
        category: 'vegetables',
        price: '',
        unit: 'kg',
        quantity: '',
        organic: false,
        certified: false
      });
      setSelectedImages([]);
      setSelectedVideos([]);
      setImagePreviews([]);
      setVideoPreviews([]);

      toast.success('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setUploading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'vegetables': return 'bg-green-100 text-green-800';
      case 'fruits': return 'bg-red-100 text-red-800';
      case 'grains-pulses-spices': return 'bg-amber-100 text-amber-800';
      case 'millets': return 'bg-yellow-100 text-yellow-800';
      case 'cereals': return 'bg-blue-100 text-blue-800';
      case 'pulses': return 'bg-purple-100 text-purple-800';
      case 'spices': return 'bg-orange-100 text-orange-800';
      case 'dairy': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Authentication check
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-user-slash text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-600 mb-2">Authentication Required</h3>
          <p className="text-gray-500">Please log in to access this page.</p>
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
              <h1 className="text-xl font-bold">🌾 {t('navigation.agricultureProducts')}</h1>
              <p className="text-sm text-green-200">{t('products.manageProducts') || 'Manage your farm products with image upload'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <LanguageSwitcher />
            <button
              onClick={fetchProducts}
              className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              disabled={loading}
            >
              <i className="fas fa-sync-alt mr-2"></i>
              {t('common.refresh') || 'Refresh'}
            </button>

            <button
              onClick={() => setShowAddForm(true)}
              className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
            >
              <i className="fas fa-plus mr-2"></i>
              {t('products.addProduct')}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === category
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
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-800">{products.length}</p>
              </div>
              <i className="fas fa-seedling text-3xl text-green-500"></i>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Organic</p>
                <p className="text-2xl font-bold text-gray-800">
                  {products.filter(p => p.organic).length}
                </p>
              </div>
              <i className="fas fa-leaf text-3xl text-green-500"></i>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{products.length > 0 ? Math.round(products.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / products.length) : 0}
                </p>
              </div>
              <i className="fas fa-tag text-3xl text-blue-500"></i>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-gray-800">
                  {products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0)}
                </p>
              </div>
              <i className="fas fa-boxes text-3xl text-purple-500"></i>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="h-48 bg-gray-200 overflow-hidden relative">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]?.url?.startsWith('http') ? product.images[0].url : `${IMAGE_BASE_URL}${product.images[0]?.url || ''}`}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        // Only fallback once to prevent infinite loops
                        if (!e.target.dataset.fallbackAttempted) {
                          e.target.dataset.fallbackAttempted = 'true';
                          e.target.src = `${IMAGE_BASE_URL}/image/dari.jpeg`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                      <i className="fas fa-image text-4xl text-gray-400 mb-2"></i>
                      <span className="text-xs text-gray-500 text-center px-2">No Image Available</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{product.name || 'Unnamed Product'}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                      {product.category || 'Other'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{product.description || 'No description'}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-bold text-green-600">₹{product.price || 0}/{product.unit || 'unit'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium">{product.quantity || 0} {product.unit || 'unit'}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      {product.organic && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          <i className="fas fa-leaf mr-1"></i>Organic
                        </span>
                      )}
                      {product.certified && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          <i className="fas fa-certificate mr-1"></i>Certified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors duration-300"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors duration-300"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-seedling text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No products found</h3>
            {selectedCategory === 'All' ? (
              <div className="space-y-4">
                <p className="text-gray-500">You haven't added any products yet.</p>
                <p className="text-sm text-blue-600">Click "Add Product" to get started!</p>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>Demo Tip:</strong> To see sample products, log in with:
                  </p>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm">
                      Email: <code className="bg-blue-100 px-2 py-1 rounded">farmer@demo.com</code><br />
                      Password: <code className="bg-blue-100 px-2 py-1 rounded">demo123</code>
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-yellow-800 mb-3">
                    <strong>Troubleshooting:</strong><br />
                    • Click "Debug" button to check your login status<br />
                    • Try "Refresh" to reload products<br />
                    • Check browser console for error messages
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('This will log you out and clear all stored data. Continue?')) {
                        useAuthStore.getState().logout();
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    🔧 Reset & Re-login
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Try selecting a different category or add products in this category</p>
            )}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">🌾 Add Agriculture Product</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Fresh Tomatoes"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains-pulses-spices">Grains, Pulses & Spices</option>
                    <option value="millets">Millets</option>
                    <option value="cereals">Cereals</option>
                    <option value="pulses">Pulses</option>
                    <option value="spices">Spices</option>
                    <option value="dairy">Dairy</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="₹"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="kg">kg</option>
                      <option value="quintal">Quintal</option>
                      <option value="ton">Ton</option>
                      <option value="liter">Liter</option>
                      <option value="piece">Piece</option>
                      <option value="dozen">Dozen</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Available quantity"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-images mr-2 text-blue-600"></i>
                    Product Images <span className="text-red-500">*</span> (Max 10)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full border-2 border-dashed border-gray-300 p-3 rounded-lg cursor-pointer hover:border-green-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Supported: JPG, PNG, JPEG, GIF, WEBP</p>

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
                    Product Videos (Optional, Max 5)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoChange}
                    className="w-full border-2 border-dashed border-gray-300 p-3 rounded-lg cursor-pointer hover:border-green-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Supported: MP4, MOV, AVI, MKV, WEBM (Max 50MB each)</p>

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical"
                    rows="3"
                    placeholder="Product description..."
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProduct.organic}
                      onChange={(e) => setNewProduct({ ...newProduct, organic: e.target.checked })}
                      className="mr-2 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">
                      <i className="fas fa-leaf text-green-600 mr-1"></i>Organic
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProduct.certified}
                      onChange={(e) => setNewProduct({ ...newProduct, certified: e.target.checked })}
                      className="mr-2 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">
                      <i className="fas fa-certificate text-blue-600 mr-1"></i>Certified
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Uploading...
                      </>
                    ) : (
                      'Add Product'
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

export default AgricultureProducts;