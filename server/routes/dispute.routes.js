const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');
const {
    createDispute,
    getMyDisputes,
    getAllDisputes,
    reviewDispute,
    resolveDispute,
    rejectDispute
} = require('../controllers/dispute.controller');

// ─────────────────────────────────────
// Multer config for evidence uploads
// ─────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads', 'disputes');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `evidence-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, PNG, WEBP, GIF) and PDF files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024, files: 5 } // 10MB per file, max 5 files
});

// All routes require Firebase authentication
router.use(verifyFirebaseToken);

// ─── User Routes ────────────────────
// Create dispute with evidence files
router.post('/create', upload.array('evidence', 5), createDispute);

// Get my disputes (raised by me or against me)
router.get('/mine', getMyDisputes);

// ─── Admin Routes ───────────────────
// Get all disputes (admin only)
router.get('/admin/all', getAllDisputes);

// Mark dispute as under_review
router.put('/:id/review', reviewDispute);

// Resolve dispute with penalty
router.put('/:id/resolve', resolveDispute);

// Reject dispute
router.put('/:id/reject', rejectDispute);

module.exports = router;
