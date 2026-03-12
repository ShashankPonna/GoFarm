import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, chatAPI, IMAGE_BASE_URL } from '../../utils/api';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [contactingFarmer, setContactingFarmer] = useState(false);
  const addToCart = useCartStore(state => state.addItem);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getOne(id);
      setProduct(response.data.product || response.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    // Add to cart and go to checkout
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    navigate('/checkout');
  };

  const handleContactFarmer = async () => {
    if (!user) {
      toast.error('Please login to contact the seller');
      navigate('/login');
      return;
    }
    const sellerId = product.seller?._id || product.seller;
    if (sellerId === user._id) {
      toast.error('This is your own listing');
      return;
    }
    try {
      setContactingFarmer(true);
      await chatAPI.createChat(sellerId);
      toast.success('Chat started!');
      navigate('/chat');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.chat) {
        toast.success('Opening existing chat...');
        navigate('/chat');
      } else {
        toast.error('Failed to start chat');
      }
    } finally {
      setContactingFarmer(false);
    }
  };

  const getImageSrc = (image) => {
    if (!image?.url) return null;
    return image.url.startsWith('http') ? image.url : `${IMAGE_BASE_URL}${image.url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-6xl text-yellow-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <button onClick={() => navigate(-1)} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition mt-4">
            <i className="fas fa-arrow-left mr-2"></i>Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-700 text-white py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-4 hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 className="text-xl font-bold">Product Details</h1>
          </div>
          <button onClick={() => navigate('/cart')} className="relative hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
            <i className="fas fa-shopping-cart text-xl"></i>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-1/2">
              <div className="h-96 bg-gray-100 relative">
                {product.images && product.images[0] ? (
                  <img
                    src={getImageSrc(product.images[0])}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (!e.target.dataset.fallbackAttempted) {
                        e.target.dataset.fallbackAttempted = 'true';
                        e.target.src = `${IMAGE_BASE_URL}/image/dari.jpeg`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <i className="fas fa-image text-6xl text-gray-300 mb-3"></i>
                    <span className="text-gray-400">No Image Available</span>
                  </div>
                )}
                {product.organic && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <i className="fas fa-leaf mr-1"></i>Organic
                  </div>
                )}
                {product.certified && (
                  <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <i className="fas fa-certificate mr-1"></i>Certified
                  </div>
                )}
              </div>
              {/* Thumbnail strip */}
              {product.images && product.images.length > 1 && (
                <div className="flex p-3 gap-2 bg-gray-50">
                  {product.images.map((img, idx) => (
                    <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img src={getImageSrc(img)} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-8">
              <div className="mb-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                  {product.category}
                </span>
                {product.status === 'available' && (
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold ml-2">
                    In Stock
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mt-3 mb-2">{product.name}</h1>

              {product.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
              )}

              {/* Price */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-green-700">₹{product.price}</span>
                  <span className="text-lg text-gray-500">per {product.unit}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <i className="fas fa-box mr-1"></i>
                  {product.quantity} {product.unit} available
                </div>
              </div>

              {/* Seller Info */}
              {product.seller && typeof product.seller === 'object' && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Seller</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                        {product.seller.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{product.seller.name}</p>
                        {product.seller.rating > 0 && (
                          <div className="flex items-center text-amber-500 text-sm">
                            <i className="fas fa-star mr-1"></i>
                            <span>{product.seller.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleContactFarmer}
                      disabled={contactingFarmer}
                      className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center"
                    >
                      {contactingFarmer ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700 mr-2"></div>Starting...</>
                      ) : (
                        <><i className="fas fa-comment-dots mr-2"></i>Chat</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Location */}
              {product.location && (product.location.city || product.location.state) && (
                <div className="flex items-center text-gray-600 mb-6">
                  <i className="fas fa-map-marker-alt mr-2 text-green-600"></i>
                  <span>{[product.location.city, product.location.state].filter(Boolean).join(', ')}</span>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700 font-medium">Quantity:</span>
                <div className="flex items-center bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-l-lg transition"
                  >
                    <i className="fas fa-minus text-sm"></i>
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-r-lg transition"
                  >
                    <i className="fas fa-plus text-sm"></i>
                  </button>
                </div>
                <span className="text-green-700 font-bold text-lg">₹{product.price * quantity}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-white border-2 border-green-600 text-green-700 font-bold py-3 rounded-xl hover:bg-green-50 transition flex items-center justify-center"
                  disabled={product.quantity === 0}
                >
                  <i className="fas fa-cart-plus mr-2"></i>
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center shadow-lg"
                  disabled={product.quantity === 0}
                >
                  <i className="fas fa-bolt mr-2"></i>
                  Buy Now
                </button>
              </div>
              {product.quantity === 0 && (
                <p className="text-center text-red-500 mt-3 font-medium">
                  <i className="fas fa-exclamation-circle mr-1"></i>This product is currently out of stock
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
