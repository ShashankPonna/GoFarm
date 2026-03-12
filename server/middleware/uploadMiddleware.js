const multer = require('multer');
const path = require('path');

// Configure multer for in-memory storage (not saving to disk)
const storage = multer.memoryStorage();

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  // Accepted image types
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/tiff'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff'];

  const fileExt = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPG, PNG, WebP, TIFF)'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  }
});

/**
 * Middleware to handle single image upload
 */
const uploadSingleImage = upload.single('image');

/**
 * Multer error handling middleware
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 10 MB limit',
        code: 'FILE_TOO_LARGE'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Only one file is allowed',
        code: 'LIMIT_FILE_COUNT'
      });
    }
  } else if (err) {
    // Custom error from fileFilter
    return res.status(400).json({
      success: false,
      message: err.message,
      code: 'INVALID_FILE'
    });
  }
  next();
};

/**
 * Validate image upload
 */
const validateImageUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided. Please upload an image.',
      code: 'NO_FILE_PROVIDED'
    });
  }

  // Check file size
  if (req.file.size === 0) {
    return res.status(400).json({
      success: false,
      message: 'Uploaded file is empty',
      code: 'EMPTY_FILE'
    });
  }

  next();
};

module.exports = {
  uploadSingleImage,
  handleMulterError,
  validateImageUpload
};
