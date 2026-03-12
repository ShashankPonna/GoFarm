const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, reportController.createReport);
router.get('/', protect, reportController.getReports);
router.put('/:id/status', protect, reportController.updateReportStatus);

module.exports = router;
