const store = require('../data/store');
const aiService = require('../services/aiService');

// @desc    Get system-wide overview statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getStats = async (req, res, next) => {
  try {
    const users = store.find('users');
    const items = store.find('items');
    const requests = store.find('requests');
    const transactions = store.find('transactions');
    const reports = store.find('reports');
    const riskFlags = store.find('riskFlags');

    const activeListings = items.filter(i => i.status === 'active').length;
    const activeBorrowings = transactions.filter(t => ['APPROVED', 'ACTIVE', 'RETURN_REQUESTED'].includes(t.status)).length;
    const completedTransactions = transactions.filter(t => t.status === 'COMPLETED').length;

    // Calculate approximate community money saved ($50 avg value per item shared)
    const communityMoneySaved = completedTransactions * 65 + 150;

    // Category breakdown for chart
    const categoryCounts = {};
    items.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    const categoryStats = Object.keys(categoryCounts).map(cat => ({
      name: cat,
      count: categoryCounts[cat]
    }));

    // Status breakdown for chart
    const transactionStatusStats = [
      { name: 'Completed', value: completedTransactions },
      { name: 'Active', value: transactions.filter(t => t.status === 'ACTIVE').length },
      { name: 'Pending Req', value: requests.filter(r => r.status === 'PENDING').length },
      { name: 'Return Requested', value: transactions.filter(t => t.status === 'RETURN_REQUESTED').length },
      { name: 'Overdue', value: transactions.filter(t => t.status === 'OVERDUE').length }
    ];

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: users.length,
        totalItems: items.length,
        activeListings,
        activeBorrowings,
        completedTransactions,
        communityMoneySaved,
        pendingReports: reports.filter(r => r.status === 'PENDING').length,
        pendingRiskFlags: riskFlags.filter(rf => rf.status === 'PENDING').length,
        categoryStats,
        transactionStatusStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const users = store.find('users').map(u => {
      const { password, ...safe } = u;
      return safe;
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or status (Admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['borrower', 'owner', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified.'
      });
    }

    const updated = store.update('users', req.params.id, { role });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const { password, ...safe } = updated;
    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      data: safe
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all AI Risk Flags (FR12)
// @route   GET /api/admin/risk-flags
// @access  Private (Admin only)
exports.getRiskFlags = async (req, res, next) => {
  try {
    const flags = store.find('riskFlags');
    return res.status(200).json({
      success: true,
      count: flags.length,
      data: flags
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update AI Risk Flag status (Admin decision)
// @route   PUT /api/admin/risk-flags/:id
// @access  Private (Admin only)
exports.updateRiskFlag = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const flag = store.findById('riskFlags', req.params.id);

    if (!flag) {
      return res.status(404).json({
        success: false,
        message: 'Risk flag not found.'
      });
    }

    const updated = store.update('riskFlags', flag.id, {
      ...(status && { status }),
      ...(adminNotes !== undefined && { adminNotes })
    });

    return res.status(200).json({
      success: true,
      message: 'Risk flag updated by administrator.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger AI Risk Analysis scan across all community activity (FR12)
// @route   POST /api/admin/run-risk-analysis
// @access  Private (Admin only)
exports.runRiskAnalysis = async (req, res, next) => {
  try {
    const users = store.find('users');
    const transactions = store.find('transactions');
    const requests = store.find('requests');

    let newFlagsCreated = 0;

    users.forEach(user => {
      const assessment = aiService.detectUserRisk(user, transactions, requests);
      if (assessment.hasRisk) {
        // Check if pending flag already exists
        const existing = store.findOne('riskFlags', rf => rf.userId === user.id && rf.status === 'PENDING');
        if (!existing) {
          store.create('riskFlags', {
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            reason: assessment.patterns.join('; '),
            severity: assessment.severity,
            patterns: assessment.patterns,
            relatedTransactions: [],
            status: 'PENDING',
            adminNotes: 'AI Flagged for human review based on transaction patterns.'
          });
          newFlagsCreated++;
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: `AI Risk scan completed. ${newFlagsCreated} new item(s) flagged for admin review.`
    });
  } catch (error) {
    next(error);
  }
};
