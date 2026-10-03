const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  updateRequestStatus,
  cancelRequest
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createRequest);
router.get('/my', protect, getMyRequests);
router.get('/incoming', protect, getIncomingRequests);
router.put('/:id/status', protect, updateRequestStatus);
router.put('/:id/cancel', protect, cancelRequest);

module.exports = router;
