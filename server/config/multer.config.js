const multer = require('multer');
const path = require('path');

// Use memory storage so file buffers go directly to Cloudinary
const storage = multer.memoryStorage();

// File filter for images and videos
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (file.fieldname === 'images') {
    const isValidImage = allowedImageTypes.test(extname.slice(1)) &&
      mimetype.startsWith('image/');
    if (isValidImage) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed for images!'), false);
    }
  } else if (file.fieldname === 'videos') {
    const isValidVideo = allowedVideoTypes.test(extname.slice(1)) &&
      mimetype.startsWith('video/');
    if (isValidVideo) {
      cb(null, true);
    } else {
      cb(new Error('Only video files (MP4, MOV, AVI, MKV, WEBM) are allowed for videos!'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// Configure multer with memory storage
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit per file
  }
});

// Middleware for product upload (multiple images and videos)
const uploadProductFiles = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]);

module.exports = {
  uploadProductFiles
};
