const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { protect } = require('../middleware/auth.middleware');
const multer = require('multer');

// Configure multer with memory storage for Cloudinary upload
// Files will be stored in memory as buffers, not on disk
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  }
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum 10MB per file.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum 4 images per post.' });
    }
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Routes
router.post('/', protect, upload.array('images', 4), handleMulterError, postController.createPost);
router.get('/', postController.getPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', protect, upload.array('images', 4), handleMulterError, postController.updatePost);
router.post('/:id/like', protect, postController.likePost);
router.post('/:id/comment', protect, postController.commentPost);
router.delete('/:id', protect, postController.deletePost);

module.exports = router;

