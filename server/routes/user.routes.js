const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// User routes
router.get('/retailers', userController.getRetailers); // public
router.get('/available-for-chat', protect, userController.getAvailableUsersForChat);
router.get('/search', protect, userController.searchUsers);
router.get('/:id', protect, userController.getUserProfile);

module.exports = router;