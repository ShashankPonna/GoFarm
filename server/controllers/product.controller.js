const Product = require('../models/Product.model');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryService');
const { emitProductAdded, emitProductUpdated, emitProductDeleted } = require('../utils/socket');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, seller, status, sort, page = 1, limit = 20 } = req.query;

    const query = {};
    if (category) query.category = category;
    if (seller) {
      // Convert seller string to ObjectId for proper MongoDB query
      const mongoose = require('mongoose');
      try {
        query.seller = new mongoose.Types.ObjectId(seller);
        console.log('🔍 Converted seller ID:', seller, '→', query.seller);
      } catch (err) {
        console.error('❌ Invalid seller ObjectId:', seller);
        return res.status(400).json({
          success: false,
          message: 'Invalid seller ID format'
        });
      }
    }
    if (status) query.status = status;

    console.log('🔍 Product query:', query);

    const skip = (page - 1) * limit;

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const products = await Product.find(query)
      .populate('seller', 'name avatar rating')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    console.log('✅ Found products:', products.length, 'Total in DB:', total);

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      products
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    console.error('❌ Full error:', error);
    next(error);
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;

    const products = await Product.find({
      $text: { $search: q }
    }).populate('seller', 'name avatar rating');

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email phone avatar rating farmDetails businessDetails')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product with images and videos
// @route   POST /api/products
// @access  Private (Farmer and Retailer)
exports.createProduct = async (req, res, next) => {
  try {
    console.log('📝 Creating product for user:', req.user._id);
    console.log('📝 Request body:', req.body);
    console.log('📝 Request files:', req.files);

    const productData = { ...req.body };

    // Handle seller - use _id directly from the user document
    productData.seller = req.user._id;
    console.log('📝 Product data with seller:', { ...productData, seller: productData.seller });

    // Handle images - upload to Cloudinary
    if (req.files && req.files.images && req.files.images.length > 0) {
      const uploadedImages = [];
      for (const file of req.files.images) {
        try {
          console.log(`📤 Uploading product image (${file.originalname}) to Cloudinary...`);
          const result = await uploadToCloudinary(file.buffer, 'products');
          uploadedImages.push({
            url: result.url,
            publicId: result.public_id
          });
          console.log(`✅ Uploaded: ${result.url}`);
        } catch (uploadError) {
          console.error('❌ Failed to upload image to Cloudinary:', uploadError);
          // Clean up already uploaded images on failure
          for (const uploaded of uploadedImages) {
            try {
              await deleteFromCloudinary(uploaded.publicId);
            } catch (cleanupError) {
              console.error('❌ Failed to cleanup image:', cleanupError);
            }
          }
          return res.status(500).json({
            success: false,
            message: 'Failed to upload product images'
          });
        }
      }
      productData.images = uploadedImages;
    }

    // Handle videos (kept as local for now - videos stay in memory buffer but are not uploaded to Cloudinary)
    if (req.files && req.files.videos) {
      console.log('⚠️ Video upload to Cloudinary not yet supported, skipping videos');
      productData.videos = [];
    }

    const product = await Product.create(productData);
    await product.populate('seller', 'name avatar rating');

    // Emit real-time event for product added
    emitProductAdded(product);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('❌ Error creating product:', error.message);
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Farmer and Retailer)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const updateData = { ...req.body };

    // Handle new images - upload to Cloudinary and delete old ones
    if (req.files && req.files.images && req.files.images.length > 0) {
      // Delete old images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          if (image.publicId) {
            try {
              await deleteFromCloudinary(image.publicId);
              console.log(`🗑️ Deleted old image: ${image.publicId}`);
            } catch (deleteError) {
              console.error('❌ Failed to delete old image from Cloudinary:', deleteError);
            }
          }
        }
      }

      // Upload new images
      const uploadedImages = [];
      for (const file of req.files.images) {
        try {
          const result = await uploadToCloudinary(file.buffer, 'products');
          uploadedImages.push({
            url: result.url,
            publicId: result.public_id
          });
        } catch (uploadError) {
          console.error('❌ Failed to upload image during update:', uploadError);
        }
      }
      updateData.images = uploadedImages;
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('seller', 'name avatar rating');

    // Emit real-time event for product updated
    emitProductUpdated(product);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Farmer and Retailer)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    const productId = product._id;

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.publicId) {
          try {
            await deleteFromCloudinary(image.publicId);
            console.log(`🗑️ Deleted product image from Cloudinary: ${image.publicId}`);
          } catch (deleteError) {
            console.error('❌ Failed to delete image from Cloudinary:', deleteError);
          }
        }
      }
    }

    await product.deleteOne();

    // Emit real-time event for product deleted
    emitProductDeleted(productId);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product review
// @route   POST /api/products/:id/review
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if already reviewed
    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'Product already reviewed'
      });
    }

    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);

    // Update product rating
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    next(error);
  }
};
