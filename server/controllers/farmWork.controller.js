const FarmWorkPost = require('../models/FarmWorkPost.model');
const User = require('../models/User.model');
const Crop = require('../models/Crop.model');

/**
 * @desc    Create a new farm work post
 * @route   POST /api/work/create
 */
exports.createWorkPost = async (req, res) => {
    try {
        // Lookup user from Firebase UID
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const {
            farmId, cropName, farmSize, workType,
            totalWorkDays, workingHoursPerDay,
            paymentType, paymentAmount, labourNeeded, description
        } = req.body;

        // Validate required fields
        if (!cropName || !farmSize || !workType || !totalWorkDays || !workingHoursPerDay || !paymentType || !paymentAmount || !labourNeeded) {
            return res.status(400).json({ success: false, message: 'All required fields must be provided' });
        }

        // Validate farmId if provided (skip empty strings)
        let validFarmId = null;
        if (farmId && farmId.trim() !== '') {
            const farm = await Crop.findById(farmId);
            if (!farm) {
                return res.status(404).json({ success: false, message: 'Farm not found' });
            }
            validFarmId = farmId;
        }

        // Auto-fill location from user profile
        const location = {
            state: user.location?.state || '',
            district: user.location?.district || '',
            taluka: user.location?.taluka || '',
            village: user.location?.village || ''
        };

        const post = await FarmWorkPost.create({
            postedBy: user._id,
            ...(validFarmId && { farmId: validFarmId }),
            cropName,
            farmSize,
            workType,
            totalWorkDays: Number(totalWorkDays),
            workingHoursPerDay,
            paymentType,
            paymentAmount: Number(paymentAmount),
            labourNeeded: Number(labourNeeded),
            labourApplied: 0,
            description: description || '',
            location,
            status: 'Open'
        });

        res.status(201).json({
            success: true,
            message: 'Work post created successfully',
            post
        });
    } catch (error) {
        console.error('Error creating work post:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

/**
 * @desc    Get all open work posts
 * @route   GET /api/work/nearby
 */
exports.getNearbyPosts = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const posts = await FarmWorkPost.find({
            status: 'Open'
        })
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name phone customID')
            .lean();

        res.json({
            success: true,
            count: posts.length,
            posts
        });
    } catch (error) {
        console.error('Error fetching nearby posts:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

/**
 * @desc    Apply to a work post
 * @route   POST /api/work/apply/:postId
 */
exports.applyToPost = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const post = await FarmWorkPost.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Work post not found' });
        }

        // Check if post is closed
        if (post.status === 'Closed') {
            return res.status(400).json({ success: false, message: 'This work post is already closed' });
        }

        // Check if labour is already full
        if (post.labourApplied >= post.labourNeeded) {
            post.status = 'Closed';
            await post.save();
            return res.status(400).json({ success: false, message: 'Labour requirement already fulfilled' });
        }

        // Prevent self-application
        if (post.postedBy.toString() === user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot apply to your own post' });
        }

        // Prevent duplicate applications
        const alreadyApplied = post.applicants.some(
            a => a.userId.toString() === user._id.toString()
        );
        if (alreadyApplied) {
            return res.status(400).json({ success: false, message: 'You have already applied to this post' });
        }

        // Push applicant data
        post.applicants.push({
            userId: user._id,
            name: user.name,
            contact: user.phone || '',
            village: user.location?.village || ''
        });

        post.labourApplied += 1;

        // Auto-close if requirement fulfilled
        if (post.labourApplied >= post.labourNeeded) {
            post.status = 'Closed';
        }

        await post.save();

        res.json({
            success: true,
            message: post.status === 'Closed'
                ? 'Applied successfully! Labour requirement now fulfilled ✅'
                : 'Applied successfully!',
            post
        });
    } catch (error) {
        console.error('Error applying to post:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

/**
 * @desc    Get my created work posts
 * @route   GET /api/work/my-posts
 */
exports.getMyPosts = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const posts = await FarmWorkPost.find({ postedBy: user._id })
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name phone customID')
            .lean();

        res.json({
            success: true,
            count: posts.length,
            posts
        });
    } catch (error) {
        console.error('Error fetching my posts:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

/**
 * @desc    Delete a work post (owner only)
 * @route   DELETE /api/work/:postId
 */
exports.deletePost = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const post = await FarmWorkPost.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Work post not found' });
        }

        if (post.postedBy.toString() !== user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
        }

        await FarmWorkPost.findByIdAndDelete(req.params.postId);

        res.json({ success: true, message: 'Work post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

/**
 * @desc    Manually close a work post (owner only)
 * @route   PUT /api/work/:postId/close
 */
exports.closePost = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.firebaseUID });
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const post = await FarmWorkPost.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Work post not found' });
        }

        if (post.postedBy.toString() !== user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to close this post' });
        }

        if (post.status === 'Closed') {
            return res.status(400).json({ success: false, message: 'Post is already closed' });
        }

        post.status = 'Closed';
        await post.save();

        res.json({ success: true, message: 'Work post closed successfully', post });
    } catch (error) {
        console.error('Error closing post:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
