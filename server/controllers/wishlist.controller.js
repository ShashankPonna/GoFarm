const Wishlist = require('../models/Wishlist.model');
const Product = require('../models/Product.model');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products.product');
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist',
      error: error.message
    });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [{ product: productId }]
      });
    } else {
      // Check if product already in wishlist
      const exists = wishlist.products.some(
        item => item.product.toString() === productId
      );

      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Product already in wishlist'
        });
      }

      wishlist.products.push({ product: productId });
      await wishlist.save();
    }

    await wishlist.populate('products.product');

    res.json({
      success: true,
      message: 'Product added to wishlist',
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding to wishlist',
      error: error.message
    });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.products = wishlist.products.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();
    await wishlist.populate('products.product');

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing from wishlist',
      error: error.message
    });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.products = [];
    await wishlist.save();

    res.json({
      success: true,
      message: 'Wishlist cleared',
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing wishlist',
      error: error.message
    });
  }
};

// Move product from wishlist to cart
exports.moveToCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Remove from wishlist
    wishlist.products = wishlist.products.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();

    res.json({
      success: true,
      message: 'Product moved to cart',
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error moving to cart',
      error: error.message
    });
  }
};
