const express = require('express');
const router = express.Router();
const { interpretAndSearch, getRecommendations } = require('../controllers/aiController');

router.post('/search', interpretAndSearch);
router.get('/recommendations', getRecommendations);

module.exports = router;
