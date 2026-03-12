const WasteProduct = require('../models/WasteProduct.model');
const { emitProductAdded, emitProductUpdated, emitProductDeleted } = require('../utils/socket');

// Get all waste products
exports.getAllWasteProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { status: 'available' };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const wasteProducts = await WasteProduct.find(query)
      .populate('seller', 'name phone email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, wasteProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get waste products by seller (farmer's own products)
exports.getMyWasteProducts = async (req, res) => {
  try {
    const wasteProducts = await WasteProduct.find({ seller: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, wasteProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create waste product with images and videos
exports.createWasteProduct = async (req, res) => {
  try {
    console.log('=== CREATE WASTE PRODUCT REQUEST ===');
    console.log('User:', req.user ? { id: req.user._id, name: req.user.name, role: req.user.role } : 'No user');
    console.log('Body:', req.body);
    console.log('Files:', req.files ? {
      images: req.files.images?.length || 0,
      videos: req.files.videos?.length || 0
    } : 'No files');

    const productData = { ...req.body };
    productData.seller = req.user._id;

    // Handle images
    if (req.files && req.files.images) {
      productData.images = req.files.images.map(file => ({
        url: `/uploads/products/${file.filename}`,
        filename: file.filename
      }));
      console.log('Images processed:', productData.images.length);
    }

    // Handle videos
    if (req.files && req.files.videos) {
      productData.videos = req.files.videos.map(file => ({
        url: `/uploads/products/${file.filename}`,
        filename: file.filename
      }));
      console.log('Videos processed:', productData.videos.length);
    }

    const wasteProduct = await WasteProduct.create(productData);
    console.log('✅ Waste product saved to database:', wasteProduct._id);
    
    await wasteProduct.populate('seller', 'name phone email');
    console.log('✅ Waste product populated with seller info');
    
    // Emit real-time event for new waste product
    emitProductAdded(wasteProduct);
    console.log('📡 Real-time event emitted for new waste product');
    
    res.status(201).json({
      success: true,
      message: 'Waste product created successfully',
      wasteProduct
    });
  } catch (error) {
    console.error('❌ Error creating waste product:', error.message);
    
    // Clean up uploaded files if creation fails
    if (req.files) {
      const fs = require('fs');
      const path = require('path');
      
      if (req.files.images) {
        req.files.images.forEach(file => {
          fs.unlink(path.join(__dirname, '../../uploads/products', file.filename), (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      }
      
      if (req.files.videos) {
        req.files.videos.forEach(file => {
          fs.unlink(path.join(__dirname, '../../uploads/products', file.filename), (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      }
    }
    
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update waste product
exports.updateWasteProduct = async (req, res) => {
  try {
    const wasteProduct = await WasteProduct.findById(req.params.id);
    
    if (!wasteProduct) {
      return res.status(404).json({ success: false, message: 'Waste product not found' });
    }
    
    // Check if user is the seller
    if (wasteProduct.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const updated = await WasteProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('seller', 'name phone email');
    
    // Emit real-time event for updated waste product
    emitProductUpdated(updated);
    console.log('📡 Real-time event emitted for updated waste product');
    
    res.json({ success: true, message: 'Waste product updated', wasteProduct: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete waste product
exports.deleteWasteProduct = async (req, res) => {
  try {
    const wasteProduct = await WasteProduct.findById(req.params.id);
    
    if (!wasteProduct) {
      return res.status(404).json({ success: false, message: 'Waste product not found' });
    }
    
    // Check if user is the seller
    if (wasteProduct.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete associated files
    const fs = require('fs');
    const path = require('path');
    
    if (wasteProduct.images && wasteProduct.images.length > 0) {
      wasteProduct.images.forEach(image => {
        if (image.filename) {
          const filePath = path.join(__dirname, '../../uploads/products', image.filename);
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting image file:', err);
          });
        }
      });
    }
    
    if (wasteProduct.videos && wasteProduct.videos.length > 0) {
      wasteProduct.videos.forEach(video => {
        if (video.filename) {
          const filePath = path.join(__dirname, '../../uploads/products', video.filename);
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting video file:', err);
          });
        }
      });
    }
    
    await WasteProduct.findByIdAndDelete(req.params.id);
    
    // Emit real-time event for deleted waste product
    emitProductDeleted(req.params.id);
    console.log('📡 Real-time event emitted for deleted waste product');
    
    res.json({ success: true, message: 'Waste product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
