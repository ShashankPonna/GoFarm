import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { productsAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../context/SocketContext';

const FarmerProducts = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  // Form state for add/edit
  const emptyProduct = {
    name: '',
    category: 'vegetables',
    price: '',
    unit: 'kg',
    quantity: '',
    description: '',
    images: [],
    videos: []
  };
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [videoPreview, setVideoPreview] = useState([]);

  // CSV state
  const [csvData, setCsvData] = useState([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvUploading, setCsvUploading] = useState(false);

  const { user, isAuthenticated } = useAuthStore();
  const { socket } = useSocket();

  const categories = [
    { id: 'all', name: 'All Products', icon: 'fa-th-large' },
    { id: 'vegetables', name: 'Vegetables', icon: 'fa-carrot' },
    { id: 'fruits', name: 'Fruits', icon: 'fa-apple-alt' },
    { id: 'millets', name: 'Millets', icon: 'fa-seedling' },
    { id: 'cereals', name: 'Cereals', icon: 'fa-seedling' },
    { id: 'pulses', name: 'Pulses', icon: 'fa-seedling' },
    { id: 'spices', name: 'Spices', icon: 'fa-pepper-hot' },
    { id: 'dairy', name: 'Dairy', icon: 'fa-glass-whiskey' },
    { id: 'edible-oil', name: 'Edible Oil', icon: 'fa-tint' },
    { id: 'waste', name: 'Waste', icon: 'fa-recycle' },
    { id: 'other', name: 'Other', icon: 'fa-box' }
  ];

  const validCategories = ['vegetables', 'fruits', 'millets', 'cereals', 'pulses', 'spices', 'dairy', 'edible-oil', 'waste', 'other'];
  const validUnits = ['kg', 'quintal', 'ton', 'liter', 'piece', 'dozen'];

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchProducts();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (socket && socket.on && user?._id) {
      const handleProductAdded = (product) => {
        if (product.seller._id === user._id) {
          setProducts(prev => [product, ...prev]);
        }
      };
      const handleProductUpdated = (product) => {
        if (product.seller._id === user._id) {
          setProducts(prev => prev.map(p => p._id === product._id ? product : p));
        }
      };
      const handleProductDeleted = (productId) => {
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
    }
  }, [socket, user?._id]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      if (!user?._id) { setLoading(false); return; }
      const response = await productsAPI.getAll({ seller: user._id });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeTab === 'all' || product.category === activeTab;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getProductStatus = (product) => {
    if (product.quantity === 0) return 'out_of_stock';
    if (product.quantity < 10) return 'low_stock';
    return 'available';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedVideos(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setVideoPreview(previews);
  };

  const resetFormState = () => {
    setNewProduct(emptyProduct);
    setSelectedImages([]);
    setSelectedVideos([]);
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    videoPreview.forEach(url => URL.revokeObjectURL(url));
    setImagePreview([]);
    setVideoPreview([]);
  };

  // ======== ADD PRODUCT ========
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('category', newProduct.category);
      formData.append('price', newProduct.price);
      formData.append('unit', newProduct.unit);
      formData.append('quantity', newProduct.quantity);
      formData.append('description', newProduct.description);
      selectedImages.forEach(image => formData.append('images', image));
      selectedVideos.forEach(video => formData.append('videos', video));

      await productsAPI.create(formData);
      setShowAddForm(false);
      resetFormState();
      alert('Product added successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ======== EDIT PRODUCT ========
  const openEditForm = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name || '',
      category: product.category || 'vegetables',
      price: product.price || '',
      unit: product.unit || 'kg',
      quantity: product.quantity || '',
      description: product.description || '',
      images: product.images || [],
      videos: product.videos || []
    });
    setSelectedImages([]);
    setSelectedVideos([]);
    setImagePreview([]);
    setVideoPreview([]);
    setShowEditForm(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('category', newProduct.category);
      formData.append('price', newProduct.price);
      formData.append('unit', newProduct.unit);
      formData.append('quantity', newProduct.quantity);
      formData.append('description', newProduct.description);

      if (selectedImages.length > 0) {
        selectedImages.forEach(image => formData.append('images', image));
      }
      if (selectedVideos.length > 0) {
        selectedVideos.forEach(video => formData.append('videos', video));
      }

      await productsAPI.update(editingProduct._id, formData);
      setShowEditForm(false);
      setEditingProduct(null);
      resetFormState();
      alert('Product updated successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ======== DELETE PRODUCT ========
  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await productsAPI.delete(id);
        alert('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      } finally {
        setLoading(false);
      }
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
      error: (err) => {
        console.error('CSV parse error:', err);
        alert('Failed to parse CSV file. Please check the format.');
      }
    });
  };

  const handleCsvUpload = async () => {
    if (csvData.length === 0) {
      alert('No products to upload.');
      return;
    }
    try {
      setCsvUploading(true);
      const response = await productsAPI.bulkCreate(csvData);
      alert(`${response.data.count} products added successfully!`);
      setShowCsvModal(false);
      setCsvData([]);
      setCsvFileName('');
      fetchProducts();
    } catch (error) {
      console.error('Error bulk uploading:', error);
      alert('Failed to upload products. Please try again.');
    } finally {
      setCsvUploading(false);
    }
  };

  const removeCsvRow = (index) => {
    setCsvData(prev => prev.filter((_, i) => i !== index));
  };

  // Auth check
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

  // =================== SHARED FORM JSX ===================
  const renderProductForm = (onSubmit, submitLabel, isEdit) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name <span className="text-red-500">*</span>
        </label>
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
          <option value="millets">Millets</option>
          <option value="cereals">Cereals</option>
          <option value="pulses">Pulses</option>
          <option value="spices">Spices</option>
          <option value="dairy">Dairy</option>
          <option value="edible-oil">Edible Oil</option>
          <option value="waste">Waste</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price <span className="text-red-500">*</span>
          </label>
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
            <option value="quintal">quintal</option>
            <option value="ton">ton</option>
            <option value="liter">liter</option>
            <option value="piece">piece</option>
            <option value="dozen">dozen</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity <span className="text-red-500">*</span>
        </label>
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

      {/* Show existing images when editing */}
      {isEdit && editingProduct?.images?.length > 0 && selectedImages.length === 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Images</label>
          <div className="grid grid-cols-3 gap-2">
            {editingProduct.images.map((img, idx) => (
              <img key={idx} src={img.url?.startsWith('http') ? img.url : `http://localhost:5000${img.url}`}
                alt={`Current ${idx + 1}`} className="w-full h-20 object-cover rounded border" />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Upload new images below to replace these.</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isEdit ? 'Replace Images (optional)' : 'Product Images'}
        </label>
        <input type="file" multiple accept="image/*" onChange={handleImageChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
        {imagePreview.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {imagePreview.map((url, index) => (
              <img key={index} src={url} alt={`Preview ${index + 1}`}
                className="w-full h-20 object-cover rounded border" />
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isEdit ? 'Replace Videos (optional)' : 'Product Videos'}
        </label>
        <input type="file" multiple accept="video/*" onChange={handleVideoChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
        {videoPreview.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {videoPreview.map((url, index) => (
              <video key={index} src={url} className="w-full h-20 object-cover rounded border" controls />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button"
          onClick={() => { isEdit ? setShowEditForm(false) : setShowAddForm(false); resetFormState(); setEditingProduct(null); }}
          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? (<><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</>) : submitLabel}
        </button>
      </div>
    </form>
  );

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
              <h1 className="text-xl font-bold">My Products</h1>
              <p className="text-sm text-green-200">Manage your farm products</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowCsvModal(true); setCsvData([]); setCsvFileName(''); }}
              className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-lg font-medium transition-colors text-sm"
              disabled={loading}>
              <i className="fas fa-file-csv mr-1"></i>
              Upload CSV
            </button>
            <button
              onClick={() => { resetFormState(); setShowAddForm(true); }}
              className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg font-medium transition-colors"
              disabled={loading}>
              <i className="fas fa-plus mr-2"></i>
              Add Product
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-6xl">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button onClick={fetchProducts} className="ml-2 underline hover:no-underline">Try again</button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Total Products</p><p className="text-2xl font-bold text-gray-800">{products.length}</p></div>
              <i className="fas fa-box text-3xl text-blue-500"></i>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Available</p><p className="text-2xl font-bold text-gray-800">{products.filter(p => getProductStatus(p) === 'available').length}</p></div>
              <i className="fas fa-check-circle text-3xl text-green-500"></i>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Low Stock</p><p className="text-2xl font-bold text-gray-800">{products.filter(p => getProductStatus(p) === 'low_stock').length}</p></div>
              <i className="fas fa-exclamation-triangle text-3xl text-yellow-500"></i>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Out of Stock</p><p className="text-2xl font-bold text-gray-800">{products.filter(p => getProductStatus(p) === 'out_of_stock').length}</p></div>
              <i className="fas fa-times-circle text-3xl text-red-500"></i>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              <input type="text" placeholder="Search products..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button key={category.id} onClick={() => setActiveTab(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${activeTab === category.id ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  <i className={`fas ${category.icon} mr-2`}></i>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-green-600 mb-4"></i>
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const status = getProductStatus(product);
              return (
                <div key={product._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]?.url?.startsWith('http') ? product.images[0].url : `http://localhost:5000${product.images[0]?.url || ''}`}
                        alt={product.name} className="w-full h-full object-cover"
                        onError={(e) => {
                          if (!e.target.dataset.fallbackAttempted) {
                            e.target.dataset.fallbackAttempted = 'true';
                            e.target.src = `http://localhost:5000/image/dari.jpeg`;
                          }
                        }} />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <i className="fas fa-image text-4xl text-gray-400 mb-2"></i>
                        <span className="text-xs text-gray-500">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Price:</span>
                        <span className="font-medium">₹{product.price}/{product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Stock:</span>
                        <span className="font-medium">{product.quantity} {product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="font-medium capitalize">{product.category}</span>
                      </div>
                      {product.rating > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Rating:</span>
                          <span className="font-medium">⭐ {product.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(product)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <i className="fas fa-edit mr-1"></i> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                        disabled={loading}>
                        <i className="fas fa-trash mr-1"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || activeTab !== 'all' ? 'Try adjusting your search or filters' : 'Add your first product to get started'}
            </p>
            <button onClick={() => { resetFormState(); setShowAddForm(true); }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors" disabled={loading}>
              <i className="fas fa-plus mr-2"></i> Add Product
            </button>
          </div>
        )}
      </div>

      {/* =================== ADD PRODUCT MODAL =================== */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
                <button onClick={() => { setShowAddForm(false); resetFormState(); }} className="text-gray-500 hover:text-gray-700">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              {renderProductForm(handleAddProduct, 'Add Product', false)}
            </div>
          </div>
        </div>
      )}

      {/* =================== EDIT PRODUCT MODAL =================== */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  <i className="fas fa-edit text-blue-600 mr-2"></i>Edit Product
                </h2>
                <button onClick={() => { setShowEditForm(false); setEditingProduct(null); resetFormState(); }} className="text-gray-500 hover:text-gray-700">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              {renderProductForm(handleEditProduct, 'Save Changes', true)}
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

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  <i className="fas fa-info-circle mr-1"></i> CSV Format Instructions:
                </p>
                <p className="text-xs text-blue-700 mb-2">Your CSV file should have these column headers:</p>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded block text-blue-900">
                  name, category, price, unit, quantity, description
                </code>
                <p className="text-xs text-blue-700 mt-2">
                  <b>Categories:</b> vegetables, fruits, millets, cereals, pulses, spices, dairy, edible-oil, waste, other<br />
                  <b>Units:</b> kg, quintal, ton, liter, piece, dozen
                </p>
              </div>

              {/* File picker */}
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

              {/* Preview Table */}
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
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Desc</th>
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
                            <td className="px-3 py-2 truncate max-w-[120px]" title={row.description}>{row.description}</td>
                            <td className="px-3 py-2 text-center">
                              <button onClick={() => removeCsvRow(idx)}
                                className="text-red-500 hover:text-red-700" title="Remove row">
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

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowCsvModal(false); setCsvData([]); setCsvFileName(''); }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
                <button onClick={handleCsvUpload} disabled={csvData.length === 0 || csvUploading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {csvUploading ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Uploading...</>
                  ) : (
                    <><i className="fas fa-cloud-upload-alt mr-2"></i>Add {csvData.length} Product{csvData.length !== 1 ? 's' : ''}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerProducts;
