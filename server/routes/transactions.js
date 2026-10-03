const express = require('express');
const router = express.Router();
const {
  getMyTransactions,
  getTransactionById,
  initiateReturn,
  confirmReturn
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyTransactions);
router.get('/:id', protect, getTransactionById);
router.put('/:id/return-request', protect, initiateReturn);
router.put('/:id/confirm-return', protect, confirmReturn);

module.exports = router;
