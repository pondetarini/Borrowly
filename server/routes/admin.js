const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUserRole,
  getRiskFlags,
  updateRiskFlag,
  runRiskAnalysis
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require admin privileges
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/risk-flags', getRiskFlags);
router.put('/risk-flags/:id', updateRiskFlag);
router.post('/run-risk-analysis', runRiskAnalysis);

module.exports = router;
