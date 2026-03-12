import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { productsAPI, IMAGE_BASE_URL } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const ConsumerListings = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [newListing, setNewListing] = useState({
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
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    // Only fetch if user is authenticated and loaded
    if (isAuthenticated && user?._id) {
      fetchListings();
    } else if (isAuthenticated === false) {
      // User is definitely not authenticated
      setLoading(false);
    }
  }, [isAuthenticated, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchListings = async () => {
    try {
      setLoading(true);

      if (!isAuthenticated || !user?._id) {
        console.log('❌ User not authenticated:', { isAuthenticated, user: user?._id });
        setLoading(false);
        return;
      }

      const response = await productsAPI.getAll({ seller: user._id });
      setListings(response.data.products || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error(t('consumerListings.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        toast.error(t('consumerListings.invalidImage', { name: file.name }));
      }
      return isValid;
    });

    if (validFiles.length + selectedImages.length > 5) {
      toast.error(t('consumerListings.maxImages'));
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

  const handleCreateListing = async (e) => {
    e.preventDefault();

    if (!newListing.name || !newListing.price || !newListing.quantity) {
      toast.error(t('consumerListings.fillRequired'));
      return;
    }

    if (selectedImages.length === 0) {
      toast.error(t('consumerListings.uploadImage'));
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('name', newListing.name);
      formData.append('description', newListing.description);
      formData.append('category', newListing.category);
      formData.append('price', parseFloat(newListing.price));
      formData.append('unit', newListing.unit);
      formData.append('quantity', parseInt(newListing.quantity));
      formData.append('organic', newListing.organic);
      formData.append('certified', newListing.certified);

      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      await productsAPI.create(formData);

      await fetchListings();

      setShowAddForm(false);
      setNewListing({
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
      setImagePreviews([]);
      toast.success(t('consumerListings.createdSuccess'));
    } catch (error) {
      console.error('Error creating listing:', error);
      const msg = error.response?.data?.message || t('consumerListings.createFailed');
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteListing = async (id) => {
    if (window.confirm(t('consumerListings.deleteConfirm'))) {
      try {
        await productsAPI.delete(id);
        await fetchListings();
        toast.success(t('consumerListings.deletedSuccess'));
      } catch (error) {
        console.error('Error deleting listing:', error);
        toast.error(t('consumerListings.deleteFailed'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => window.history.back()} className="mr-4">
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <div>
              <h1 className="text-xl font-bold">🛒 {t('consumerListings.title')}</h1>
              <p className="text-sm text-purple-200">{t('consumerListings.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            {t('consumerListings.createListing')}
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('consumerListings.totalListings')}</p>
                <p className="text-2xl font-bold text-gray-800">{listings.length}</p>
              </div>
              <i className="fas fa-list text-3xl text-purple-500"></i>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('consumerListings.active')}</p>
                <p className="text-2xl font-bold text-gray-800">{listings.filter(l => l.status === 'available').length}</p>
              </div>
              <i className="fas fa-check-circle text-3xl text-green-500"></i>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('consumerListings.totalValue')}</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{listings.reduce((sum, l) => sum + (Number(l.price) * Number(l.quantity) || 0), 0)}
                </p>
              </div>
              <i className="fas fa-rupee-sign text-3xl text-blue-500"></i>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">{t('consumerListings.loadingListings')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(listing => (
              <div
                key={listing._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="h-48 bg-gray-200 overflow-hidden relative">
                  {listing.images && listing.images[0] ? (
                    <img
                      src={listing.images[0].url?.startsWith('http') ? listing.images[0].url : `${IMAGE_BASE_URL}${listing.images[0].url}`}
                      alt={listing.name || 'Product'}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        if (!e.target.dataset.fallbackAttempted) {
                          e.target.dataset.fallbackAttempted = 'true';
                          e.target.src = `${IMAGE_BASE_URL}/image/dari.jpeg`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <i className="fas fa-image text-4xl text-gray-400 mb-2"></i>
                      <span className="text-xs text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{listing.name || 'Unnamed Product'}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{listing.description || 'No description'}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-bold text-purple-600">₹{listing.price || 0}/{listing.unit || 'unit'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium">{listing.quantity || 0} {listing.unit || 'unit'}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      {listing.organic && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          <i className="fas fa-leaf mr-1"></i>Organic
                        </span>
                      )}
                      {listing.certified && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          <i className="fas fa-certificate mr-1"></i>Certified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors duration-300">
                      <i className="fas fa-eye mr-1"></i>
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteListing(listing._id)}
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

        {!loading && listings.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-store text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-4">Create your first listing for consumers</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Listing
            </button>
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">🛒 Create Consumer Listing</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleCreateListing} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newListing.name}
                    onChange={(e) => setNewListing({ ...newListing, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Fresh Tomatoes"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newListing.category}
                    onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
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
                      value={newListing.price}
                      onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="₹"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={newListing.unit}
                      onChange={(e) => setNewListing({ ...newListing, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    value={newListing.quantity}
                    onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Available quantity"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-images mr-2 text-purple-600"></i>
                    Product Images <span className="text-red-500">*</span> (Max 5)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full border-2 border-dashed border-gray-300 p-3 rounded-lg cursor-pointer hover:border-purple-500 text-sm"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newListing.description}
                    onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical"
                    rows="3"
                    placeholder="Product description..."
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newListing.organic}
                      onChange={(e) => setNewListing({ ...newListing, organic: e.target.checked })}
                      className="mr-2 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">
                      <i className="fas fa-leaf text-green-600 mr-1"></i>Organic
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newListing.certified}
                      onChange={(e) => setNewListing({ ...newListing, certified: e.target.checked })}
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
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Creating...
                      </>
                    ) : (
                      'Create Listing'
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

export default ConsumerListings;