const express = require('express');
const router = express.Router();
const { createReview, getItemReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/item/:itemId', getItemReviews);

module.exports = router;
