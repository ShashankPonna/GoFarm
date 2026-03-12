const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);
router.post('/', protect, newsController.createNews);
router.put('/:id', protect, newsController.updateNews);
router.delete('/:id', protect, newsController.deleteNews);

module.exports = router;
