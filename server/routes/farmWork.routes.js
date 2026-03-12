const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');
const {
    createWorkPost,
    getNearbyPosts,
    applyToPost,
    getMyPosts,
    deletePost,
    closePost
} = require('../controllers/farmWork.controller');

// All routes require Firebase authentication
router.use(verifyFirebaseToken);

// Create a new work post
router.post('/create', createWorkPost);

// Get nearby open work posts (same district)
router.get('/nearby', getNearbyPosts);

// Get my created work posts
router.get('/my-posts', getMyPosts);

// Apply to a work post
router.post('/apply/:postId', applyToPost);

// Manually close a work post (owner only)
router.put('/:postId/close', closePost);

// Delete a work post (owner only)
router.delete('/:postId', deletePost);

module.exports = router;
