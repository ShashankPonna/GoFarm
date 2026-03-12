const ExchangeRequest = require('../models/ExchangeRequest.model');
const ExchangeCounter = require('../models/ExchangeCounter.model');
const User = require('../models/User.model');
const MarketPrice = require('../models/MarketPrice.model');

// ─────────────────────────────────────
// HELPER: Calculate item value from MarketPrice
// ─────────────────────────────────────
const calculateExchangeValue = async (itemName, quantity) => {
    const price = await MarketPrice.findOne({
        productName: { $regex: new RegExp(`^${itemName}$`, 'i') }
    });

    if (!price) {
        // Fallback: return 0 if item not found in MarketPrice
        return { value: 0, pricePerUnit: 0, unit: 'kg', found: false };
    }

    const totalValue = price.currentPrice * quantity;
    return {
        value: Math.round(totalValue * 100) / 100,
        pricePerUnit: price.currentPrice,
        unit: price.unit,
        found: true
    };
};

// ─────────────────────────────────────
// 1) CREATE EXCHANGE REQUEST
// ─────────────────────────────────────
/**
 * POST /api/exchange/create
 * Body: { receiverCustomID, offeredItem, offeredQuantity, requestedItem, requestedQuantity }
 * Protected by verifyFirebaseToken
 */
exports.createExchangeRequest = async (req, res) => {
    try {
        const { receiverCustomID, offeredItem, offeredQuantity, requestedItem, requestedQuantity, paymentMethod } = req.body;

        // Get requester from Firebase UID
        const requester = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!requester) {
            return res.status(404).json({ success: false, message: 'Requester not found' });
        }

        // Validate required fields
        if (!receiverCustomID || !offeredItem || !offeredQuantity || !requestedItem || !requestedQuantity) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Prevent self-exchange
        if (requester.customID === receiverCustomID.toUpperCase()) {
            return res.status(400).json({ success: false, message: 'Cannot exchange with yourself' });
        }

        // Validate receiver exists
        const receiver = await User.findOne({ customID: receiverCustomID.toUpperCase() });
        if (!receiver) {
            return res.status(404).json({ success: false, message: `No user found with ID: ${receiverCustomID}` });
        }

        // Validate same district or taluka
        const sameDistrict = requester.location.district === receiver.location.district;
        const sameTaluka = requester.location.taluka === receiver.location.taluka;
        if (!sameDistrict && !sameTaluka) {
            return res.status(400).json({
                success: false,
                message: 'Exchange only allowed between users in the same district or taluka'
            });
        }

        // Check trust score threshold (minimum 20)
        if (requester.trustScore < 20) {
            return res.status(403).json({
                success: false,
                message: 'Your trust score is too low to create exchanges. Minimum: 20'
            });
        }

        // Prevent duplicate active exchange between same users
        const existingActive = await ExchangeRequest.findOne({
            requesterCustomID: requester.customID,
            receiverCustomID: receiverCustomID.toUpperCase(),
            status: { $in: ['pending', 'accepted'] }
        });
        if (existingActive) {
            return res.status(409).json({
                success: false,
                message: 'You already have an active exchange with this user',
                existingExchangeID: existingActive.exchangeID
            });
        }

        // Calculate values from MarketPrice
        const offered = await calculateExchangeValue(offeredItem, offeredQuantity);
        const requested = await calculateExchangeValue(requestedItem, requestedQuantity);
        const valueDiff = Math.round((offered.value - requested.value) * 100) / 100;

        // Generate unique exchange ID atomically
        const exchangeID = await ExchangeCounter.getNextID();

        // Create exchange request
        const exchange = await ExchangeRequest.create({
            exchangeID,
            requesterCustomID: requester.customID,
            receiverCustomID: receiverCustomID.toUpperCase(),
            offeredItem: offeredItem.trim(),
            offeredQuantity,
            requestedItem: requestedItem.trim(),
            requestedQuantity,
            calculatedOfferedValue: offered.value,
            calculatedRequestedValue: requested.value,
            valueDifference: valueDiff,
            status: 'pending',
            paymentMethod: paymentMethod || 'none',
            paymentStatus: paymentMethod === 'online' ? 'pending' : (paymentMethod === 'cod' ? 'pending' : 'not_required'),
            requesterName: requester.name,
            requesterPhone: requester.phone,
            receiverName: receiver.name,
            receiverPhone: receiver.phone
        });

        // Socket.IO notification to receiver (if connected)
        const io = req.app.get('io');
        if (io) {
            io.emit(`exchange:new:${receiverCustomID.toUpperCase()}`, {
                exchangeID: exchange.exchangeID,
                from: requester.customID,
                fromName: requester.name,
                offeredItem,
                requestedItem,
                message: `${requester.name} (${requester.customID}) wants to exchange ${offeredQuantity} ${offeredItem} for ${requestedQuantity} ${requestedItem}`
            });
        }

        res.status(201).json({
            success: true,
            message: 'Exchange request created successfully',
            exchange,
            valueInfo: {
                offeredItemPrice: offered.found ? `₹${offered.pricePerUnit}/${offered.unit}` : 'Price not found',
                requestedItemPrice: requested.found ? `₹${requested.pricePerUnit}/${requested.unit}` : 'Price not found',
                valueDifference: valueDiff
            }
        });
    } catch (error) {
        console.error('❌ Create exchange error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────
// 2) GET SENT REQUESTS
// ─────────────────────────────────────
/**
 * GET /api/exchange/sent
 * Returns exchanges created by the logged-in user
 */
exports.getSentRequests = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const exchanges = await ExchangeRequest.find({ requesterCustomID: user.customID })
            .sort({ createdAt: -1 });

        res.json({ success: true, count: exchanges.length, exchanges });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────
// 3) GET RECEIVED REQUESTS
// ─────────────────────────────────────
/**
 * GET /api/exchange/received
 * Returns exchanges where the logged-in user is the receiver
 */
exports.getReceivedRequests = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const exchanges = await ExchangeRequest.find({ receiverCustomID: user.customID })
            .sort({ createdAt: -1 });

        res.json({ success: true, count: exchanges.length, exchanges });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────
// 4) ACCEPT EXCHANGE
// ─────────────────────────────────────
/**
 * PUT /api/exchange/:id/accept
 * Only the receiver can accept. Only works on pending exchanges.
 */
exports.acceptExchange = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const exchange = await ExchangeRequest.findOne({ exchangeID: req.params.id });
        if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });

        // Only receiver can accept
        if (exchange.receiverCustomID !== user.customID) {
            return res.status(403).json({ success: false, message: 'Only the receiver can accept this exchange' });
        }

        // Only pending can be accepted
        if (exchange.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Cannot accept exchange with status: ${exchange.status}` });
        }

        exchange.status = 'accepted';
        await exchange.save();

        // Notify requester
        const io = req.app.get('io');
        if (io) {
            io.emit(`exchange:accepted:${exchange.requesterCustomID}`, {
                exchangeID: exchange.exchangeID,
                acceptedBy: user.customID,
                message: `${user.name} accepted your exchange request`
            });
        }

        res.json({ success: true, message: 'Exchange accepted', exchange });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────
// 5) REJECT EXCHANGE
// ─────────────────────────────────────
/**
 * PUT /api/exchange/:id/reject
 * Only the receiver can reject. Requester loses -2 trust score.
 */
exports.rejectExchange = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const exchange = await ExchangeRequest.findOne({ exchangeID: req.params.id });
        if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });

        if (exchange.receiverCustomID !== user.customID) {
            return res.status(403).json({ success: false, message: 'Only the receiver can reject this exchange' });
        }

        if (exchange.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Cannot reject exchange with status: ${exchange.status}` });
        }

        exchange.status = 'rejected';
        await exchange.save();

        // Trust penalty for requester (-2)
        await User.findOneAndUpdate(
            { customID: exchange.requesterCustomID },
            { $inc: { trustScore: -2 } }
        );

        // Notify requester
        const io = req.app.get('io');
        if (io) {
            io.emit(`exchange:rejected:${exchange.requesterCustomID}`, {
                exchangeID: exchange.exchangeID,
                rejectedBy: user.customID,
                message: `${user.name} rejected your exchange request`
            });
        }

        res.json({ success: true, message: 'Exchange rejected', exchange });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────
// 6) COMPLETE EXCHANGE (Dual-Confirm)
// ─────────────────────────────────────
/**
 * PUT /api/exchange/:id/complete
 * Both requester and receiver must confirm. When both confirm → completed, +5 trust each.
 */
exports.completeExchange = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const exchange = await ExchangeRequest.findOne({ exchangeID: req.params.id });
        if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });

        if (exchange.status !== 'accepted') {
            return res.status(400).json({ success: false, message: 'Exchange must be accepted before completion' });
        }

        // Determine which party is confirming
        const isRequester = exchange.requesterCustomID === user.customID;
        const isReceiver = exchange.receiverCustomID === user.customID;

        if (!isRequester && !isReceiver) {
            return res.status(403).json({ success: false, message: 'You are not part of this exchange' });
        }

        // Set their confirmation flag
        if (isRequester) {
            if (exchange.requesterConfirmed) {
                return res.status(400).json({ success: false, message: 'You have already confirmed completion' });
            }
            exchange.requesterConfirmed = true;
        }
        if (isReceiver) {
            if (exchange.receiverConfirmed) {
                return res.status(400).json({ success: false, message: 'You have already confirmed completion' });
            }
            exchange.receiverConfirmed = true;
        }

        // If both confirmed → mark completed
        if (exchange.requesterConfirmed && exchange.receiverConfirmed) {
            exchange.status = 'completed';
            exchange.completedAt = new Date();

            // Increase trust score for both (+5)
            await User.findOneAndUpdate(
                { customID: exchange.requesterCustomID },
                { $inc: { trustScore: 5 } }
            );
            await User.findOneAndUpdate(
                { customID: exchange.receiverCustomID },
                { $inc: { trustScore: 5 } }
            );

            // Notify both parties
            const io = req.app.get('io');
            if (io) {
                const msg = { exchangeID: exchange.exchangeID, message: 'Exchange completed! +5 trust score' };
                io.emit(`exchange:completed:${exchange.requesterCustomID}`, msg);
                io.emit(`exchange:completed:${exchange.receiverCustomID}`, msg);
            }
        }

        await exchange.save();

        res.json({
            success: true,
            message: exchange.status === 'completed'
                ? 'Exchange completed! Both parties confirmed. Trust score +5 for each.'
                : 'Your confirmation recorded. Waiting for the other party to confirm.',
            exchange
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────
// 7) CANCEL EXCHANGE
// ─────────────────────────────────────
/**
 * PUT /api/exchange/:id/cancel
 * Only the requester can cancel, and only while pending.
 */
exports.cancelExchange = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const exchange = await ExchangeRequest.findOne({ exchangeID: req.params.id });
        if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });

        if (exchange.requesterCustomID !== user.customID) {
            return res.status(403).json({ success: false, message: 'Only the requester can cancel this exchange' });
        }

        if (exchange.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Cannot cancel exchange with status: ${exchange.status}` });
        }

        exchange.status = 'cancelled';
        await exchange.save();

        // Notify receiver
        const io = req.app.get('io');
        if (io) {
            io.emit(`exchange:cancelled:${exchange.receiverCustomID}`, {
                exchangeID: exchange.exchangeID,
                message: `Exchange ${exchange.exchangeID} was cancelled by ${user.name}`
            });
        }

        res.json({ success: true, message: 'Exchange cancelled', exchange });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────
// 8) MARK PAYMENT (Online / COD)
// ─────────────────────────────────────
/**
 * PUT /api/exchange/:id/pay
 * Mark payment as complete.
 */
exports.markPayment = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const exchange = await ExchangeRequest.findOne({ exchangeID: req.params.id });
        if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });

        // Only parties involved can mark payment
        if (exchange.requesterCustomID !== user.customID && exchange.receiverCustomID !== user.customID) {
            return res.status(403).json({ success: false, message: 'You are not part of this exchange' });
        }

        if (exchange.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Payment already completed' });
        }

        exchange.paymentStatus = 'paid';
        exchange.paidAt = new Date();
        await exchange.save();

        res.json({
            success: true,
            message: 'Payment marked as complete',
            exchange,
            receipt: {
                exchangeID: exchange.exchangeID,
                from: { name: exchange.requesterName, id: exchange.requesterCustomID, phone: exchange.requesterPhone },
                to: { name: exchange.receiverName, id: exchange.receiverCustomID, phone: exchange.receiverPhone },
                offeredItem: exchange.offeredItem,
                offeredQuantity: exchange.offeredQuantity,
                requestedItem: exchange.requestedItem,
                requestedQuantity: exchange.requestedQuantity,
                valueDifference: exchange.valueDifference,
                paymentMethod: exchange.paymentMethod,
                paymentStatus: 'paid',
                paidAt: exchange.paidAt,
                createdAt: exchange.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
