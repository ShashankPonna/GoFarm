const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connection.controller');
const { protect } = require('../middleware/auth.middleware');

// All connection routes require authentication
router.use(protect);

router.post('/send/:receiverId', connectionController.sendRequest);
router.put('/accept/:connectionId', connectionController.acceptRequest);
router.put('/reject/:connectionId', connectionController.rejectRequest);
router.get('/mine', connectionController.getMyConnections);

module.exports = router;
