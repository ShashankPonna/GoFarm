const Dispute = require('../models/Dispute.model');
const DisputeCounter = require('../models/DisputeCounter.model');
const ExchangeRequest = require('../models/ExchangeRequest.model');
const User = require('../models/User.model');

// ─────────────────────────────────────
// 1) CREATE DISPUTE
// ─────────────────────────────────────
/**
 * POST /api/disputes/create
 * Body: { exchangeID, reason, description }
 * Files: req.files (evidence images/PDFs via multer)
 */
exports.createDispute = async (req, res) => {
    try {
        const { exchangeID, reason, description } = req.body;
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Validate required fields
        if (!exchangeID || !reason || !description) {
            return res.status(400).json({ success: false, message: 'exchangeID, reason, and description are required' });
        }

        // Validate exchange exists
        const exchange = await ExchangeRequest.findOne({ exchangeID });
        if (!exchange) {
            return res.status(404).json({ success: false, message: `Exchange ${exchangeID} not found` });
        }

        // Validate exchange status (must be accepted or completed)
        if (!['accepted', 'completed'].includes(exchange.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot raise dispute on exchange with status: ${exchange.status}. Must be accepted or completed.`
            });
        }

        // Validate user is part of the exchange
        const isRequester = exchange.requesterCustomID === user.customID;
        const isReceiver = exchange.receiverCustomID === user.customID;
        if (!isRequester && !isReceiver) {
            return res.status(403).json({ success: false, message: 'You are not part of this exchange' });
        }

        // Determine the other party
        const againstCustomID = isRequester ? exchange.receiverCustomID : exchange.requesterCustomID;

        // Prevent duplicate open dispute for same exchange by same user
        const existingDispute = await Dispute.findOne({
            exchangeID,
            raisedByCustomID: user.customID,
            status: { $in: ['open', 'under_review'] }
        });
        if (existingDispute) {
            return res.status(409).json({
                success: false,
                message: 'You already have an active dispute for this exchange',
                existingDisputeID: existingDispute.disputeID
            });
        }

        // Process evidence files (uploaded via multer)
        const evidenceFiles = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                evidenceFiles.push({
                    url: `/uploads/disputes/${file.filename}`,
                    originalName: file.originalname,
                    fileType: file.mimetype
                });
            }
        }

        // Get against user's name
        const againstUser = await User.findOne({ customID: againstCustomID });

        // Generate unique dispute ID
        const disputeID = await DisputeCounter.getNextID();

        // Create dispute
        const dispute = await Dispute.create({
            disputeID,
            exchangeID,
            raisedByCustomID: user.customID,
            againstCustomID,
            reason,
            description,
            evidenceFiles,
            status: 'open',
            raisedByName: user.name,
            againstName: againstUser ? againstUser.name : 'Unknown'
        });

        // Socket.IO: notify admin
        const io = req.app.get('io');
        if (io) {
            io.emit('dispute:new', {
                disputeID: dispute.disputeID,
                exchangeID,
                raisedBy: user.customID,
                reason,
                message: `New dispute raised by ${user.name} (${user.customID}) for exchange ${exchangeID}`
            });
        }

        res.status(201).json({
            success: true,
            message: 'Dispute raised successfully',
            dispute
        });
    } catch (error) {
        console.error('❌ Create dispute error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────
// 2) GET MY DISPUTES
// ─────────────────────────────────────
/**
 * GET /api/disputes/mine
 * Returns disputes where user is involved (raised by or against).
 */
exports.getMyDisputes = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const disputes = await Dispute.find({
            $or: [
                { raisedByCustomID: user.customID },
                { againstCustomID: user.customID }
            ]
        }).sort({ createdAt: -1 });

        res.json({ success: true, count: disputes.length, disputes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────
// 3) GET ALL DISPUTES (Admin Only)
// ─────────────────────────────────────
/**
 * GET /api/disputes/admin/all?status=open
 * Admin-only. Returns all disputes, optionally filtered by status.
 */
exports.getAllDisputes = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const disputes = await Dispute.find(filter).sort({ createdAt: -1 });

        // Count by status for dashboard
        const counts = {
            open: await Dispute.countDocuments({ status: 'open' }),
            under_review: await Dispute.countDocuments({ status: 'under_review' }),
            resolved: await Dispute.countDocuments({ status: 'resolved' }),
            rejected: await Dispute.countDocuments({ status: 'rejected' }),
            total: await Dispute.countDocuments()
        };

        res.json({ success: true, count: disputes.length, counts, disputes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────
// 4) REVIEW DISPUTE (Admin Only)
// ─────────────────────────────────────
/**
 * PUT /api/disputes/:id/review
 * Admin marks dispute as under_review.
 */
exports.reviewDispute = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const dispute = await Dispute.findOne({ disputeID: req.params.id });
        if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

        if (dispute.status !== 'open') {
            return res.status(400).json({ success: false, message: `Cannot review dispute with status: ${dispute.status}` });
        }

        dispute.status = 'under_review';
        await dispute.save();

        // Notify the parties
        const io = req.app.get('io');
        if (io) {
            io.emit(`dispute:reviewed:${dispute.raisedByCustomID}`, {
                disputeID: dispute.disputeID,
                message: `Your dispute ${dispute.disputeID} is now under review`
            });
        }

        res.json({ success: true, message: 'Dispute is now under review', dispute });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────
// 5) RESOLVE DISPUTE (Admin Only)
// ─────────────────────────────────────
/**
 * PUT /api/disputes/:id/resolve
 * Body: { adminDecision, trustPenalty }
 * Admin resolves and deducts trustScore from guilty party.
 */
exports.resolveDispute = async (req, res) => {
    try {
        const { adminDecision, trustPenalty } = req.body;

        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        if (!adminDecision) {
            return res.status(400).json({ success: false, message: 'Admin decision is required' });
        }

        const dispute = await Dispute.findOne({ disputeID: req.params.id });
        if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

        if (!['open', 'under_review'].includes(dispute.status)) {
            return res.status(400).json({ success: false, message: `Cannot resolve dispute with status: ${dispute.status}` });
        }

        // Resolve dispute
        dispute.status = 'resolved';
        dispute.adminDecision = adminDecision;
        dispute.trustPenalty = trustPenalty || 0;
        dispute.resolvedAt = new Date();
        await dispute.save();

        // Deduct trust score from guilty user (the one the dispute is against)
        if (trustPenalty > 0) {
            await User.findOneAndUpdate(
                { customID: dispute.againstCustomID },
                { $inc: { trustScore: -trustPenalty } }
            );
        }

        // Check if user has 3+ disputes resolved against them → mark high risk
        const disputeCount = await Dispute.countDocuments({
            againstCustomID: dispute.againstCustomID,
            status: 'resolved'
        });
        let highRiskWarning = null;
        if (disputeCount >= 3) {
            highRiskWarning = `⚠️ User ${dispute.againstCustomID} now has ${disputeCount} resolved disputes against them — HIGH RISK`;
            console.log(highRiskWarning);
        }

        // Notify both parties
        const io = req.app.get('io');
        if (io) {
            const msg = {
                disputeID: dispute.disputeID,
                status: 'resolved',
                decision: adminDecision,
                penalty: trustPenalty
            };
            io.emit(`dispute:resolved:${dispute.raisedByCustomID}`, {
                ...msg, message: `Your dispute ${dispute.disputeID} has been resolved`
            });
            io.emit(`dispute:resolved:${dispute.againstCustomID}`, {
                ...msg, message: `Dispute ${dispute.disputeID} resolved against you. Trust score -${trustPenalty}`
            });
        }

        res.json({
            success: true,
            message: `Dispute resolved. Trust penalty: -${trustPenalty} applied to ${dispute.againstCustomID}`,
            dispute,
            highRiskWarning
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────
// 6) REJECT DISPUTE (Admin Only)
// ─────────────────────────────────────
/**
 * PUT /api/disputes/:id/reject
 * Admin rejects a dispute (no penalty applied).
 */
exports.rejectDispute = async (req, res) => {
    try {
        const { adminDecision } = req.body;

        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const dispute = await Dispute.findOne({ disputeID: req.params.id });
        if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

        if (!['open', 'under_review'].includes(dispute.status)) {
            return res.status(400).json({ success: false, message: `Cannot reject dispute with status: ${dispute.status}` });
        }

        dispute.status = 'rejected';
        dispute.adminDecision = adminDecision || 'Dispute rejected by admin';
        dispute.resolvedAt = new Date();
        await dispute.save();

        // Notify raiser
        const io = req.app.get('io');
        if (io) {
            io.emit(`dispute:rejected:${dispute.raisedByCustomID}`, {
                disputeID: dispute.disputeID,
                message: `Your dispute ${dispute.disputeID} has been rejected`
            });
        }

        res.json({ success: true, message: 'Dispute rejected', dispute });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
