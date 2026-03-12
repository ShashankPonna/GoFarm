const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const User = require('../models/User.model');

/**
 * POST /api/orders
 * Create a new order from cart items.
 * Body: { items: [{ product, quantity, price, name }], deliveryAddress, paymentMethod }
 */
exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Build order items - handle both product ID and name-based items
    const orderItems = [];
    let sellerId = null;

    for (const item of items) {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.price) || 0;
      const orderItem = {
        quantity: qty,
        price: price,
        total: price * qty,
        name: item.name || 'Product'
      };

      // Try to link to a product if we have a valid product ID
      if (item.product && item.product.match && item.product.match(/^[0-9a-fA-F]{24}$/)) {
        orderItem.product = item.product;
        // Get seller from the product
        if (!sellerId) {
          const dbProduct = await Product.findById(item.product);
          if (dbProduct) {
            sellerId = dbProduct.seller;
            orderItem.name = dbProduct.name || item.name || 'Product';
          }
        }
      }

      orderItems.push(orderItem);
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const total = subtotal + deliveryFee;

    // Fallback seller to buyer if no product found
    if (!sellerId) sellerId = req.user._id;

    const order = new Order({
      buyer: req.user._id,
      seller: sellerId,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress: deliveryAddress || {},
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: 'pending',
      status: 'confirmed'
    });

    await order.save();

    // Populate for response (safely)
    try {
      await order.populate('buyer', 'name phone customID');
      await order.populate('seller', 'name phone customID');
      await order.populate('items.product', 'name price unit images');
    } catch (popErr) {
      console.log('⚠️ Populate warning:', popErr.message);
    }

    // Decrease product stock for items with valid product IDs
    for (const item of orderItems) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { quantity: -item.quantity }
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
      receipt: {
        orderNumber: order.orderNumber,
        buyer: {
          name: order.buyer?.name || req.user.name,
          phone: order.buyer?.phone || req.user.phone,
          customID: order.buyer?.customID || req.user.customID
        },
        seller: {
          name: order.seller?.name || 'Seller',
          phone: order.seller?.phone || '',
          customID: order.seller?.customID || ''
        },
        items: order.items,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/orders
 * Get orders for the current user (as buyer or seller).
 */
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }]
    })
      .populate('buyer', 'name phone customID')
      .populate('seller', 'name phone customID')
      .populate('items.product', 'name price unit images')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/orders/:id
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name phone customID')
      .populate('seller', 'name phone customID')
      .populate('items.product', 'name price unit images');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * PUT /api/orders/:id/status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('buyer', 'name phone customID')
      .populate('seller', 'name phone customID')
      .populate('items.product');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
