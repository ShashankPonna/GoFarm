const express = require('express');
const router = express.Router();
const wasteProductController = require('../controllers/wasteProduct.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadProductFiles } = require('../config/multer.config');

router.get('/', wasteProductController.getAllWasteProducts);
router.get('/my-products', protect, wasteProductController.getMyWasteProducts);
router.post('/', protect, uploadProductFiles, wasteProductController.createWasteProduct);
router.put('/:id', protect, wasteProductController.updateWasteProduct);
router.delete('/:id', protect, wasteProductController.deleteWasteProduct);

module.exports = router;
