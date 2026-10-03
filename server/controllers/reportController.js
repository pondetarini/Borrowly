const store = require('../data/store');

// @desc    Create a moderation report
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, targetTitle = '', reason, description } = req.body;

    if (!targetType || !targetId || !reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide target type, target ID, reason, and detailed description.'
      });
    }

    const newReport = store.create('reports', {
      reporterId: req.user.id,
      reporterName: req.user.name,
      targetType,
      targetId,
      targetTitle,
      reason,
      description,
      status: 'PENDING',
      adminAction: ''
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted. Our moderation team will review this shortly.',
      data: newReport
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports
// @access  Private (Admin only)
exports.getReports = async (req, res, next) => {
  try {
    const reports = store.find('reports');
    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status and action (Admin)
// @route   PUT /api/reports/:id
// @access  Private (Admin only)
exports.updateReport = async (req, res, next) => {
  try {
    const { status, adminAction } = req.body;
    const report = store.findById('reports', req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    const updated = store.update('reports', report.id, {
      ...(status && { status }),
      ...(adminAction !== undefined && { adminAction })
    });

    return res.status(200).json({
      success: true,
      message: 'Report updated by administrator.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
