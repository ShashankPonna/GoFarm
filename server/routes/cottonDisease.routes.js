const express = require('express');
const router = express.Router();
const { 
  detectDisease,
  getDetectionHistory,
  getDetectionDetail,
  deleteDetection
} = require('../controllers/cottonDiseaseController');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');
const { uploadSingleImage, handleMulterError, validateImageUpload } = require('../middleware/uploadMiddleware');

/**
 * POST /api/cotton/detect
 * Detect cotton disease from uploaded image
 * Auth: Required
 * Body: multipart/form-data with 'image' field
 */
router.post(
  '/detect',
  uploadSingleImage,
  handleMulterError,
  validateImageUpload,
  detectDisease
);

/**
 * GET /api/cotton/history
 * Get user's detection history with pagination
 * Auth: Required
 * Query: limit, page, sortBy
 */
router.get(
  '/history',
  verifyFirebaseToken,
  getDetectionHistory
);

/**
 * GET /api/cotton/detection/:detectionId
 * Get detailed detection result
 * Auth: Required
 * Params: detectionId
 */
router.get(
  '/detection/:detectionId',
  verifyFirebaseToken,
  getDetectionDetail
);

/**
 * DELETE /api/cotton/detection/:detectionId
 * Delete a detection record
 * Auth: Required
 * Params: detectionId
 */
router.delete(
  '/detection/:detectionId',
  verifyFirebaseToken,
  deleteDetection
);

module.exports = router;
