const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    createExchangeRequest,
    getSentRequests,
    getReceivedRequests,
    getOpenExchanges,
    acceptExchange,
    rejectExchange,
    completeExchange,
    cancelExchange,
    markPayment
} = require('../controllers/exchange.controller');

// All routes require authentication (Supports Hybrid Auth)
router.use(protect);

// Create a new exchange request
router.post('/create', createExchangeRequest);

// Get exchanges I sent
router.get('/sent', getSentRequests);

// Get open/broadcast exchange offers (anyone can accept)
router.get('/open', getOpenExchanges);

// Get exchanges sent to me
router.get('/received', getReceivedRequests);

// Accept an exchange (receiver only)
router.put('/:id/accept', acceptExchange);

// Reject an exchange (receiver only)
router.put('/:id/reject', rejectExchange);

// Confirm completion (both parties)
router.put('/:id/complete', completeExchange);

// Cancel an exchange (requester only, while pending)
router.put('/:id/cancel', cancelExchange);

// Mark payment as complete
router.put('/:id/pay', markPayment);

module.exports = router;
