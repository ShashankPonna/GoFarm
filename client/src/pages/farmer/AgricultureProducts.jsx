import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Papa from '../../libs/papaparse.js';
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
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const emptyProduct = {
    name: '',
    description: '',
    category: 'vegetables',
    price: '',
    unit: 'kg',
    quantity: '',
    organic: false,
    certified: false
  };
  const [newProduct, setNewProduct] = useState(emptyProduct);

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  // CSV state
  const [csvData, setCsvData] = useState([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvUploading, setCsvUploading] = useState(false);

  const validCategories = ['vegetables', 'fruits', 'millets', 'cereals', 'pulses', 'spices', 'dairy', 'edible-oil', 'waste', 'other'];
  const validUnits = ['kg', 'quintal', 'ton', 'liter', 'piece', 'dozen'];

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
    setEditingProduct(product);
    setNewProduct({
      name: product.name || '',
      description: product.description || '',
      category: product.category || 'vegetables',
      price: product.price || '',
      unit: product.unit || 'kg',
      quantity: product.quantity || '',
      organic: product.organic || false,
      certified: product.certified || false
    });
    setSelectedImages([]);
    setSelectedVideos([]);
    setImagePreviews([]);
    setVideoPreviews([]);
    setShowEditForm(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
      toast.error('Please fill in all required fields');
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

      if (selectedImages.length > 0) {
        selectedImages.forEach((image) => formData.append('images', image));
      }
      if (selectedVideos.length > 0) {
        selectedVideos.forEach((video) => formData.append('videos', video));
      }

      await productsAPI.update(editingProduct._id, formData);
      setShowEditForm(false);
      setEditingProduct(null);
      setNewProduct(emptyProduct);
      setSelectedImages([]);
      setSelectedVideos([]);
      setImagePreviews([]);
      setVideoPreviews([]);
      toast.success('Product updated successfully!');
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setUploading(false);
    }
  };

  // ======== CSV UPLOAD ========
  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleaned = results.data
          .filter(row => row.name && row.name.trim())
          .map(row => ({
            name: row.name?.trim() || '',
            category: validCategories.includes(row.category?.trim().toLowerCase()) ? row.category.trim().toLowerCase() : 'other',
            price: row.price || '0',
            unit: validUnits.includes(row.unit?.trim().toLowerCase()) ? row.unit.trim().toLowerCase() : 'kg',
            quantity: row.quantity || '0',
            description: row.description?.trim() || ''
          }));
        setCsvData(cleaned);
      },
      error: () => toast.error('Failed to parse CSV file.')
    });
  };

  const handleCsvUpload = async () => {
    if (csvData.length === 0) { toast.error('No products to upload.'); return; }
    try {
      setCsvUploading(true);
      const response = await productsAPI.bulkCreate(csvData);
      toast.success(`${response.data.count} products added!`);
      setShowCsvModal(false);
      setCsvData([]);
      setCsvFileName('');
      await fetchProducts();
    } catch (error) {
      console.error('Error bulk uploading:', error);
      toast.error('Failed to upload products.');
    } finally {
      setCsvUploading(false);
    }
  };

  const removeCsvRow = (index) => setCsvData(prev => prev.filter((_, i) => i !== index));

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
              onClick={() => { setShowCsvModal(true); setCsvData([]); setCsvFileName(''); }}
              className="bg-purple-500 hover:bg-purple-600 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm"
            >
              <i className="fas fa-file-csv mr-1"></i>
              Upload CSV
            </button>

            <button
              onClick={() => { setNewProduct(emptyProduct); setSelectedImages([]); setSelectedVideos([]); setImagePreviews([]); setVideoPreviews([]); setShowAddForm(true); }}
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

      {/* =================== EDIT PRODUCT MODAL =================== */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  <i className="fas fa-edit text-blue-600 mr-2"></i>Edit Product
                </h2>
                <button onClick={() => { setShowEditForm(false); setEditingProduct(null); setNewProduct(emptyProduct); }} className="text-gray-500 hover:text-gray-700">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                  <input type="text" value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Fresh Tomatoes" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price <span className="text-red-500">*</span></label>
                    <input type="number" value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="₹" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select value={newProduct.unit}
                      onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity <span className="text-red-500">*</span></label>
                  <input type="number" value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Available quantity" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical"
                    rows="3" placeholder="Product description..." />
                </div>

                {/* Show existing images */}
                {editingProduct?.images?.length > 0 && selectedImages.length === 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Images</label>
                    <div className="grid grid-cols-3 gap-2">
                      {editingProduct.images.map((img, idx) => (
                        <img key={idx} src={img.url?.startsWith('http') ? img.url : `${IMAGE_BASE_URL}${img.url}`}
                          alt={`Current ${idx + 1}`} className="w-full h-20 object-cover rounded-lg border" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Upload new images below to replace these.</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-images mr-2 text-blue-600"></i>Replace Images (optional)
                  </label>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange}
                    className="w-full border-2 border-dashed border-gray-300 p-3 rounded-lg cursor-pointer hover:border-green-500 text-sm" />
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                          <button type="button" onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 text-xs">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={newProduct.organic}
                      onChange={(e) => setNewProduct({ ...newProduct, organic: e.target.checked })} className="mr-2 w-4 h-4" />
                    <span className="text-sm text-gray-700"><i className="fas fa-leaf text-green-600 mr-1"></i>Organic</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={newProduct.certified}
                      onChange={(e) => setNewProduct({ ...newProduct, certified: e.target.checked })} className="mr-2 w-4 h-4" />
                    <span className="text-sm text-gray-700"><i className="fas fa-certificate text-blue-600 mr-1"></i>Certified</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowEditForm(false); setEditingProduct(null); setNewProduct(emptyProduct); }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                  <button type="submit" disabled={uploading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">
                    {uploading ? (<><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</>) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =================== CSV UPLOAD MODAL =================== */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  <i className="fas fa-file-csv text-green-600 mr-2"></i>Upload Products from CSV
                </h2>
                <button onClick={() => { setShowCsvModal(false); setCsvData([]); setCsvFileName(''); }} className="text-gray-500 hover:text-gray-700">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 font-medium mb-2"><i className="fas fa-info-circle mr-1"></i> CSV Format:</p>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded block text-blue-900">
                  name, category, price, unit, quantity, description
                </code>
                <p className="text-xs text-blue-700 mt-2">
                  <b>Categories:</b> vegetables, fruits, millets, cereals, pulses, spices, dairy, edible-oil, waste, other<br />
                  <b>Units:</b> kg, quintal, ton, liter, piece, dozen
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select CSV File</label>
                <input type="file" accept=".csv" onChange={handleCsvFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                {csvFileName && (
                  <p className="text-sm text-gray-600 mt-1">
                    <i className="fas fa-file mr-1"></i> {csvFileName} — {csvData.length} product{csvData.length !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>

              {csvData.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">Preview ({csvData.length} products)</h3>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">#</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Category</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Price</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Unit</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Qty</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-600"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.map((row, idx) => (
                          <tr key={idx} className="border-t hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                            <td className="px-3 py-2 font-medium">{row.name}</td>
                            <td className="px-3 py-2 capitalize">{row.category}</td>
                            <td className="px-3 py-2">₹{row.price}</td>
                            <td className="px-3 py-2">{row.unit}</td>
                            <td className="px-3 py-2">{row.quantity}</td>
                            <td className="px-3 py-2 text-center">
                              <button onClick={() => removeCsvRow(idx)} className="text-red-500 hover:text-red-700" title="Remove">
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowCsvModal(false); setCsvData([]); setCsvFileName(''); }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                <button onClick={handleCsvUpload} disabled={csvData.length === 0 || csvUploading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  {csvUploading ? (<><i className="fas fa-spinner fa-spin mr-2"></i>Uploading...</>) : (<><i className="fas fa-cloud-upload-alt mr-2"></i>Add {csvData.length} Product{csvData.length !== 1 ? 's' : ''}</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgricultureProducts;