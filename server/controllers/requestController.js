const store = require('../data/store');

// Helper to check date overlap
function datesOverlap(startA, endA, startB, endB) {
  return new Date(startA) <= new Date(endB) && new Date(endA) >= new Date(startB);
}

// @desc    Create borrow/rent request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res, next) => {
  try {
    const { itemId, startDate, endDate, message, type = 'borrow' } = req.body;

    if (!itemId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide item ID, start date, and end date.'
      });
    }

    const item = store.findById('items', itemId);
    if (!item || item.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Item is not currently available for borrowing.'
      });
    }

    if (item.ownerId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot borrow your own listed item.'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date.'
      });
    }

    const diffTime = Math.abs(end - start);
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalCost = type === 'rent' ? (item.pricePerDay * durationDays) : 0;

    // Check for conflicting active transactions
    const existingTransactions = store.find('transactions', t =>
      t.itemId === itemId &&
      ['APPROVED', 'ACTIVE'].includes(t.status) &&
      datesOverlap(t.startDate, t.endDate, startDate, endDate)
    );

    if (existingTransactions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This item already has an approved reservation during these dates.'
      });
    }

    const newRequest = store.create('requests', {
      itemId,
      itemTitle: item.title,
      borrowerId: req.user.id,
      borrowerName: req.user.name,
      ownerId: item.ownerId,
      ownerName: item.ownerName,
      startDate,
      endDate,
      durationDays,
      type: item.pricePerDay > 0 ? 'rent' : 'borrow',
      totalCost,
      deposit: item.deposit,
      message: message || '',
      status: 'PENDING'
    });

    // Notify owner
    store.create('notifications', {
      recipientId: item.ownerId,
      senderId: req.user.id,
      title: 'New Borrow Request Received',
      message: `${req.user.name} requested to borrow "${item.title}" for ${durationDays} day(s).`,
      type: 'request_created',
      link: '/owner/requests'
    });

    return res.status(201).json({
      success: true,
      message: 'Request submitted to owner successfully.',
      data: newRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's outgoing borrow requests
// @route   GET /api/requests/my
// @access  Private
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = store.find('requests', r => r.borrowerId === req.user.id);
    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's incoming borrow requests
// @route   GET /api/requests/incoming
// @access  Private (Owner/Admin)
exports.getIncomingRequests = async (req, res, next) => {
  try {
    const requests = store.find('requests', r => r.ownerId === req.user.id);
    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a request
// @route   PUT /api/requests/:id/status
// @access  Private (Owner only)
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status, note = '' } = req.body; // 'APPROVED' or 'REJECTED'
    const request = store.findById('requests', req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
    }

    if (request.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the item owner can decide on this request.'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status.toLowerCase()}.`
      });
    }

    if (status === 'APPROVED') {
      // Conflict check (Section 7: Atomic approval & conflict guard)
      const conflict = store.findOne('transactions', t =>
        t.itemId === request.itemId &&
        ['APPROVED', 'ACTIVE'].includes(t.status) &&
        datesOverlap(t.startDate, t.endDate, request.startDate, request.endDate)
      );

      if (conflict) {
        return res.status(400).json({
          success: false,
          message: 'Conflict detected: This item is already reserved for overlapping dates.'
        });
      }

      // Mark request as APPROVED
      const updatedRequest = store.update('requests', request.id, { status: 'APPROVED' });

      // Determine initial transaction status: if startDate is today or in the past, set to ACTIVE
      const todayStr = new Date().toISOString().split('T')[0];
      const initialTxnStatus = request.startDate <= todayStr ? 'ACTIVE' : 'APPROVED';

      // Create transaction
      const transaction = store.create('transactions', {
        requestId: request.id,
        itemId: request.itemId,
        itemTitle: request.itemTitle,
        borrowerId: request.borrowerId,
        borrowerName: request.borrowerName,
        ownerId: request.ownerId,
        ownerName: request.ownerName,
        startDate: request.startDate,
        endDate: request.endDate,
        actualReturnDate: null,
        type: request.type,
        amountPaid: request.totalCost,
        depositHeld: request.deposit,
        status: initialTxnStatus
      });

      // Notify borrower
      store.create('notifications', {
        recipientId: request.borrowerId,
        senderId: req.user.id,
        title: 'Request Approved! 🎉',
        message: `Your request for "${request.itemTitle}" was approved by ${req.user.name}.`,
        type: 'request_approved',
        link: '/transactions'
      });

      return res.status(200).json({
        success: true,
        message: 'Request approved and borrowing transaction created.',
        data: {
          request: updatedRequest,
          transaction
        }
      });
    } else if (status === 'REJECTED') {
      const updatedRequest = store.update('requests', request.id, { status: 'REJECTED' });

      // Notify borrower
      store.create('notifications', {
        recipientId: request.borrowerId,
        senderId: req.user.id,
        title: 'Request Declined',
        message: `Your request for "${request.itemTitle}" was declined. ${note ? `Note: ${note}` : ''}`,
        type: 'request_rejected',
        link: '/my-requests'
      });

      return res.status(200).json({
        success: true,
        message: 'Request rejected.',
        data: updatedRequest
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid status update. Choose APPROVED or REJECTED.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel request (Borrower action)
// @route   PUT /api/requests/:id/cancel
// @access  Private
exports.cancelRequest = async (req, res, next) => {
  try {
    const request = store.findById('requests', req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
    }

    if (request.borrowerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own requests.'
      });
    }

    store.update('requests', request.id, { status: 'CANCELLED' });

    // Cancel related transaction if exists and not yet completed
    const txn = store.findOne('transactions', t => t.requestId === request.id);
    if (txn && ['APPROVED', 'PENDING'].includes(txn.status)) {
      store.update('transactions', txn.id, { status: 'CANCELLED' });
    }

    // Notify owner
    store.create('notifications', {
      recipientId: request.ownerId,
      senderId: req.user.id,
      title: 'Request Cancelled',
      message: `${req.user.name} cancelled the borrowing request for "${request.itemTitle}".`,
      type: 'system',
      link: '/owner/requests'
    });

    return res.status(200).json({
      success: true,
      message: 'Request cancelled successfully.'
    });
  } catch (error) {
    next(error);
  }
};
