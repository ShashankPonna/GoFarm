const News = require('../models/News.model');

// Get all news
exports.getAllNews = async (req, res) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;
    const query = { isPublished: true };
    
    if (category) {
      query.category = category;
    }
    
    const news = await News.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await News.countDocuments(query);
    
    res.json({
      success: true,
      news,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get single news by ID
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('author', 'name email');
    
    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }
    
    // Increment views
    news.views += 1;
    await news.save();
    
    res.json({ success: true, news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create news (admin only)
exports.createNews = async (req, res) => {
  try {
    const { title, content, summary, category, image, tags } = req.body;
    
    const news = await News.create({
      title,
      content,
      summary,
      category,
      image,
      tags,
      author: req.user.id
    });
    
    res.status(201).json({ success: true, message: 'News created successfully', news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update news
exports.updateNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }
    
    res.json({ success: true, message: 'News updated successfully', news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete news
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    
    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }
    
    res.json({ success: true, message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
